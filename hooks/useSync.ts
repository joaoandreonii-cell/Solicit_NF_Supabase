import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Asset, Vehicle } from '../types';

// ---------------------------------------------------------------------------
// Sync queue — persists failed remote ops and retries on reconnect
// ---------------------------------------------------------------------------

const QUEUE_KEY = 'transport_app_sync_queue';

type QueuedOp =
    | { type: 'pushAssets' }
    | { type: 'pushVehicles' }
    | { type: 'delete'; table: 'assets-cmi' | 'vehicles-cmi'; id: string };

function loadQueue(): QueuedOp[] {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
}

function saveQueue(q: QueuedOp[]) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

function enqueue(op: QueuedOp) {
    const q = loadQueue();
    if (op.type === 'pushAssets' || op.type === 'pushVehicles') {
        // One entry per type is enough — on flush we read current localStorage
        if (!q.some(o => o.type === op.type)) q.push(op);
    } else {
        q.push(op);
    }
    saveQueue(q);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useSync = () => {
    const [isSyncing, setIsSyncing] = useState(false);

    const pullData = useCallback(async () => {
        setIsSyncing(true);
        try {
            const [{ data: remoteAssets }, { data: remoteVehicles }] = await Promise.all([
                supabase.from('assets-cmi').select('*'),
                supabase.from('vehicles-cmi').select('*')
            ]);

            const formattedAssets: Asset[] = (remoteAssets || []).map(a => ({
                fiscalCode: a.fiscal_code,
                patrimony: a.patrimony,
                description: a.description
            }));

            const formattedVehicles: Vehicle[] = (remoteVehicles || []).map(v => ({
                plate: v.plate,
                model: v.model,
                unit: v.unit,
                sector: v.sector
            }));

            return { assets: formattedAssets, vehicles: formattedVehicles };
        } catch (error) {
            console.error('Error pulling data from Supabase:', error);
            throw error;
        } finally {
            setIsSyncing(false);
        }
    }, []);

    const pushAssets = useCallback(async (assets: Asset[]) => {
        if (assets.length === 0) return;
        setIsSyncing(true);
        try {
            const formatted = assets.map(a => ({
                fiscal_code: a.fiscalCode,
                patrimony: a.patrimony,
                description: a.description,
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase.rpc('upsert_assets_cmi', { assets_json: formatted });
            if (error) throw error;
        } catch (error) {
            enqueue({ type: 'pushAssets' });
            console.error('Error pushing assets to Supabase:', error);
            throw error;
        } finally {
            setIsSyncing(false);
        }
    }, []);

    const pushVehicles = useCallback(async (vehicles: Vehicle[]) => {
        if (vehicles.length === 0) return;
        setIsSyncing(true);
        try {
            const formatted = vehicles.map(v => ({
                plate: v.plate,
                model: v.model,
                unit: v.unit,
                sector: v.sector,
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase.rpc('upsert_vehicles_cmi', { vehicles_json: formatted });
            if (error) throw error;
        } catch (error) {
            enqueue({ type: 'pushVehicles' });
            console.error('Error pushing vehicles to Supabase:', error);
            throw error;
        } finally {
            setIsSyncing(false);
        }
    }, []);

    const clearRemoteStorage = useCallback(async (table: 'assets-cmi' | 'vehicles-cmi') => {
        setIsSyncing(true);
        try {
            const { error } = await supabase.from(table).delete().neq('updated_at', '1970-01-01');
            if (error) throw error;
        } catch (error) {
            console.error(`Error clearing ${table} in Supabase:`, error);
            throw error;
        } finally {
            setIsSyncing(false);
        }
    }, []);

    const deleteFromRemote = useCallback(async (table: 'assets-cmi' | 'vehicles-cmi', id: string) => {
        setIsSyncing(true);
        try {
            if (table === 'assets-cmi') {
                const [fCode, patrimony] = id.split('|');
                const { error } = await supabase
                    .from(table)
                    .delete()
                    .eq('fiscal_code', fCode)
                    .eq('patrimony', patrimony);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from(table)
                    .delete()
                    .eq('plate', id);
                if (error) throw error;
            }
        } catch (error) {
            enqueue({ type: 'delete', table, id });
            console.error(`Error deleting from ${table} in Supabase:`, error);
            throw error;
        } finally {
            setIsSyncing(false);
        }
    }, []);

    // Retry all queued operations — called automatically on reconnect
    const flushQueue = useCallback(async () => {
        const queue = loadQueue();
        if (queue.length === 0) return;

        const remaining: QueuedOp[] = [];
        setIsSyncing(true);
        try {
            for (const op of queue) {
                try {
                    if (op.type === 'pushAssets') {
                        const raw = localStorage.getItem('transport_app_assets');
                        if (raw) {
                            const assets: Asset[] = JSON.parse(raw);
                            const formatted = assets.map(a => ({
                                fiscal_code: a.fiscalCode,
                                patrimony: a.patrimony,
                                description: a.description,
                                updated_at: new Date().toISOString()
                            }));
                            const { error } = await supabase.rpc('upsert_assets_cmi', { assets_json: formatted });
                            if (error) throw error;
                        }
                    } else if (op.type === 'pushVehicles') {
                        const raw = localStorage.getItem('transport_app_vehicles');
                        if (raw) {
                            const vehicles: Vehicle[] = JSON.parse(raw);
                            const formatted = vehicles.map(v => ({
                                plate: v.plate,
                                model: v.model,
                                unit: v.unit,
                                sector: v.sector,
                                updated_at: new Date().toISOString()
                            }));
                            const { error } = await supabase.rpc('upsert_vehicles_cmi', { vehicles_json: formatted });
                            if (error) throw error;
                        }
                    } else if (op.type === 'delete') {
                        if (op.table === 'assets-cmi') {
                            const [fCode, patrimony] = op.id.split('|');
                            const { error } = await supabase
                                .from(op.table).delete()
                                .eq('fiscal_code', fCode).eq('patrimony', patrimony);
                            if (error) throw error;
                        } else {
                            const { error } = await supabase
                                .from(op.table).delete().eq('plate', op.id);
                            if (error) throw error;
                        }
                    }
                } catch {
                    remaining.push(op); // keep failed ops for next reconnect
                }
            }
        } finally {
            saveQueue(remaining);
            setIsSyncing(false);
        }
    }, []);

    return {
        isSyncing,
        pullData,
        pushAssets,
        pushVehicles,
        clearRemoteStorage,
        deleteFromRemote,
        flushQueue,
    };
};
