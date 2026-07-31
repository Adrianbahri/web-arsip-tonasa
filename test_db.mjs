import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://fkcjnhixavufcjkjprno.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrY2puaGl4YXZ1ZmNqa2pwcm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MjAzOTIsImV4cCI6MjA5OTI5NjM5Mn0.0rBGExm5hD5bHwL4ZNhUosZ9s2Vf8ZZ0Kxcy4tIBGtY');
const { data, error } = await supabase.storage.listBuckets();
console.log("Buckets:", data, error);
