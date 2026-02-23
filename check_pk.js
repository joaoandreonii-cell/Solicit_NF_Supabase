
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uiyhudlbuhhuqhtdzwme.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpeWh1ZGxidWhodXFodGR6d21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjcyNDEsImV4cCI6MjA4Njk0MzI0MX0.Mur6OsV4K9d51xh2UAcbnkYTKKGxNi7p8UBoi8pFSQg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPK() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.log('Inserting test row...');
    const uniqueVal = 'PK-TEST-' + Date.now();
    const { data, error } = await supabase.from('assets').insert({
        fiscal_code: uniqueVal,
        description: 'Testing PK',
        patrimony: '-'
    }).select();

    if (error) {
        console.error('Insert error:', error);
    } else if (data) {
        console.log('Inserted record:', data[0]);
        // If 'id' is present and it's a UUID, then it's likely the PK
    }
}

checkPK();
