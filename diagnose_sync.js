
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://uiyhudlbuhhuqhtdzwme.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpeWh1ZGxidWhodXFodGR6d21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjcyNDEsImV4cCI6MjA4Njk0MzI0MX0.Mur6OsV4K9d51xh2UAcbnkYTKKGxNi7p8UBoi8pFSQg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseSync() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    let output = 'Sync Diagnosis Report\n====================\n\n';

    console.log('Running diagnosis...');

    // Test Assets
    const { error: assetError } = await supabase
        .from('assets')
        .upsert([{ fiscal_code: 'D-001', patrimony: '1', description: 'Test', updated_at: new Date().toISOString() }], { onConflict: 'fiscal_code, patrimony' });

    output += 'Assets Test:\n';
    if (assetError) {
        output += `Error: ${JSON.stringify(assetError, null, 2)}\n`;
        if (assetError.code === '42P10') output += 'SUGGESTION: Add composite unique constraint.\n';
    } else {
        output += 'Success!\n';
    }

    // Test Vehicles
    const { error: vehicleError } = await supabase
        .from('vehicles')
        .upsert([{ plate: 'D-888', model: 'Test', unit: '-', sector: '-', updated_at: new Date().toISOString() }], { onConflict: 'plate' });

    output += '\nVehicles Test:\n';
    if (vehicleError) {
        output += `Error: ${JSON.stringify(vehicleError, null, 2)}\n`;
    } else {
        output += 'Success!\n';
    }

    fs.writeFileSync('sync_report.txt', output);
    console.log('Diagnosis complete. Check sync_report.txt');
}

diagnoseSync();
