import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
    // try to get one request
    const { data: reqs, error: selErr } = await supabase.from('requests').select('*').limit(1);
    if (selErr) {
        console.error('Select error:', selErr);
        return;
    }
    console.log('Fetched requests:', reqs);

    if (reqs && reqs.length > 0) {
        const id = reqs[0].id;
        console.log('Trying to delete request with id:', id, typeof id);
        
        // try to delete it
        const { data, error } = await supabase.from('requests').delete().eq('id', id);
        if (error) {
            console.error('Delete error:', error);
        } else {
            console.log('Delete success:', data);
        }
    } else {
        console.log('No requests found.');
    }
}

testDelete();
