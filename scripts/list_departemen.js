import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
let SUPABASE_URL = '';
let SUPABASE_KEY = '';
env.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].replace(/"/g, '').trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) SUPABASE_KEY = line.split('=')[1].replace(/"/g, '').trim();
});

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  let allData = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase.from('archives').select('id, departemen').range(from, from + step - 1);
    if (error) {
      console.error(error);
      return;
    }
    if (data && data.length > 0) {
      allData = [...allData, ...data];
      if (data.length < step) hasMore = false;
      else from += step;
    } else {
      hasMore = false;
    }
  }

  const distinct = new Set(allData.map(d => d.departemen));
  console.log('Distinct Departemen values:');
  for (const val of distinct) {
    console.log(`"${val}" (length: ${val ? val.length : 0})`);
  }
}
run();
