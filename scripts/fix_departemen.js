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

  let count = 0;
  for (const item of allData) {
    if (!item.departemen) continue;
    const clean = item.departemen.trim().toUpperCase();
    let target = clean;
    if (clean === 'KEUANGA' || clean === 'KEUNGAN' || clean === 'KEUANGAN ' || clean === 'KUANGAN' || clean.includes('KEUANG')) {
        target = 'KEUANGAN';
    }
    
    if (target !== item.departemen) {
       console.log(`Fixing "${item.departemen}" -> "${target}"`);
       await supabase.from('archives').update({ departemen: target }).eq('id', item.id);
       count++;
    }
  }
  console.log(`Updated ${count} items`);
}
run();
