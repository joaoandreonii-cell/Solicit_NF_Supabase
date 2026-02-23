
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://uiyhudlbuhhuqhtdzwme.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpeWh1ZGxidWhodXFodGR6d21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjcyNDEsImV4cCI6MjA4Njk0MzI0MX0.Mur6OsV4K9d51xh2UAcbnkYTKKGxNi7p8UBoi8pFSQg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectSchema() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    let report = 'Schema Inspection Report\n========================\n\n';

    console.log('Inspecting constraints...');

    // We can use a trick to see what columns exist and what the PK is by looking at the first row
    const { data: cols, error: colError } = await supabase.from('assets').select('*').limit(1);

    if (colError) {
        report += `Error reading assets: ${JSON.stringify(colError)}\n`;
    } else {
        report += `Assets Columns: ${Object.keys(cols[0] || {}).join(', ')}\n\n`;
    }

    // Try to catch the error again with more info
    const testRow = { fiscal_code: 'TEST-PK', patrimony: 'PK-1', description: 'PK Test', updated_at: new Date().toISOString() };
    const { error: upsertError } = await supabase
        .from('assets')
        .upsert([testRow], { onConflict: 'fiscal_code, patrimony' });

    report += 'Upsert Test Results:\n';
    if (upsertError) {
        report += `Error: ${JSON.stringify(upsertError, null, 2)}\n`;
    } else {
        report += 'Success on Upsert!\n';
    }

    fs.writeFileSync('schema_report.txt', report);
    console.log('Inspection complete. check schema_report.txt');
}

inspectSchema();
