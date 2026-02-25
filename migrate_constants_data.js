import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Real data from constants.ts (manually extracted for the script)
const ASSETS = JSON.parse(readFileSync('./temp_assets.json', 'utf8'));
const VEHICLES = JSON.parse(readFileSync('./temp_vehicles.json', 'utf8'));

async function migrate() {
    console.log('Migrating assets...');
    const formattedAssets = ASSETS.map(a => ({
        fiscal_code: a.fiscalCode,
        patrimony: a.patrimony,
        description: a.description,
        updated_at: new Date().toISOString()
    }));

    const { error: assetError } = await supabase.rpc('upsert_assets', { assets_json: formattedAssets });
    if (assetError) console.error('Error migrating assets:', assetError);
    else console.log(`Successfully migrated ${ASSETS.length} assets.`);

    console.log('Migrating vehicles...');
    const formattedVehicles = VEHICLES.map(v => ({
        plate: v.plate,
        model: v.model,
        unit: v.unit,
        sector: v.sector,
        updated_at: new Date().toISOString()
    }));

    const { error: vehicleError } = await supabase.rpc('upsert_vehicles', { vehicles_json: formattedVehicles });
    if (vehicleError) console.error('Error migrating vehicles:', vehicleError);
    else console.log(`Successfully migrated ${VEHICLES.length} vehicles.`);
}

migrate();
