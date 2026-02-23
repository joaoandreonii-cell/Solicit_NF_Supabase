
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uiyhudlbuhhuqhtdzwme.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpeWh1ZGxidWhodXFodGR6d21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjcyNDEsImV4cCI6MjA4Njk0MzI0MX0.Mur6OsV4K9d51xh2UAcbnkYTKKGxNi7p8UBoi8pFSQg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    console.log('Fetching assets...');
    const { data, error } = await supabase.from('assets').select('*').limit(1);

    if (error) {
        console.error('Error fetching assets:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns in assets:', Object.keys(data[0]));
        console.log('Sample data:', data[0]);
    } else {
        console.log('No data found in assets table.');
        // Try to insert a dummy row to see if it fails or returns new columns
        const { data: insertData, error: insertError } = await supabase.from('assets').insert({
            fiscal_code: 'TEST-' + Date.now(),
            description: 'Test Description',
            patrimony: '-'
        }).select();

        if (insertError) {
            console.error('Insert error:', insertError);
        } else if (insertData) {
            console.log('Inserted columns:', Object.keys(insertData[0]));
        }
    }
}

checkSchema();
