
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://uiyhudlbuhhuqhtdzwme.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpeWh1ZGxidWhodXFodGR6d21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjcyNDEsImV4cCI6MjA4Njk0MzI0MX0.Mur6OsV4K9d51xh2UAcbnkYTKKGxNi7p8UBoi8pFSQg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPK() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    // We can use a raw SQL query via a trick if RLS allows, but since we can't run raw SQL easily from JS client without RPC,
    // let's try to insert two items with SAME fiscal_code but DIFFERENT patrimony.
    // This WILL fail if fiscal_code is the PK.

    const testData = [
        { fiscal_code: 'CONFLICT_TEST', patrimony: '1', description: 'Test 1', updated_at: new Date().toISOString() },
        { fiscal_code: 'CONFLICT_TEST', patrimony: '2', description: 'Test 2', updated_at: new Date().toISOString() }
    ];

    const { error } = await supabase
        .from('assets')
        .upsert(testData, { onConflict: 'fiscal_code, patrimony' });

    let report = 'Conflict Test Report\n====================\n\n';
    if (error) {
        report += `Error: ${JSON.stringify(error, null, 2)}\n`;
        if (error.message.includes('assets_pkey')) {
            report += '\nCONCLUSION: fiscal_code is currently the Primary Key. It needs to be changed to a composite key (fiscal_code, patrimony).\n';
        }
    } else {
        report += 'Success! (This might mean the table was empty or the PK is already composite/id-based)\n';
    }

    fs.writeFileSync('conflict_report.txt', report);
    console.log('Test complete. Check conflict_report.txt');
}

checkPK();
