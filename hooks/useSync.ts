import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Asset, Vehicle } from '../types';

export const useSync = () => {
    const [isSyncing, setIsSyncing] = useState(false);

    const pullData = useCallback(async () => {
        setIsSyncing(true);
        try {
            const [{ data: remoteAssets }, { data: remoteVehicles }] = await Promise.all([
                supabase.from('assets').select('*'),
                supabase.from('vehicles').select('*')
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

            // Upsert assets using composite key (supported if unique index exists)
            const { error } = await supabase
                .from('assets')
                .upsert(formatted, { onConflict: 'fiscal_code, patrimony' });

            if (error) throw error;
        } catch (error) {
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

            // Upsert vehicles
            const { error } = await supabase
                .from('vehicles')
                .upsert(formatted, { onConflict: 'plate' });

            if (error) throw error;
        } catch (error) {
            console.error('Error pushing vehicles to Supabase:', error);
            throw error;
        } finally {
            setIsSyncing(false);
        }
    }, []);

    const clearRemoteStorage = useCallback(async (table: 'assets' | 'vehicles') => {
        setIsSyncing(true);
        try {
            // Warning: This deletes everything in the table
            const { error } = await supabase.from(table).delete().neq('updated_at', '1970-01-01'); // Hack to delete all
            if (error) throw error;
        } catch (error) {
            console.error(`Error clearing ${table} in Supabase:`, error);
            throw error;
        } finally {
            setIsSyncing(false);
        }
    }, []);

    const deleteFromRemote = useCallback(async (table: 'assets' | 'vehicles', id: string) => {
        setIsSyncing(true);
        try {
            if (table === 'assets') {
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
            console.error(`Error deleting from ${table} in Supabase:`, error);
            throw error;
        } finally {
            setIsSyncing(false);
        }
    }, []);

    return {
        isSyncing,
        pullData,
        pushAssets,
        pushVehicles,
        clearRemoteStorage,
        deleteFromRemote
    };
};
