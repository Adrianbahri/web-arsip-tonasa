-- ========================================================
-- TABEL SENSOR MONITORING (Suhu & Kelembaban)
-- ========================================================
create table public.sensor_monitoring (
  id uuid default gen_random_uuid() primary key,
  suhu numeric not null,
  kelembaban numeric not null,
  keterangan text default 'Data dari ESP',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mengaktifkan Row Level Security (RLS) pada tabel sensor_monitoring
alter table public.sensor_monitoring enable row level security;

-- Policy RLS untuk tabel sensor_monitoring:
-- 1. Semua dapat membaca data (select)
create policy "Anyone can select sensor data" on public.sensor_monitoring
  for select using (true);

-- 2. ESP/Semua dapat menginsert data ke tabel (Bisa disesuaikan agar lebih aman, misalnya hanya dari anon key tertentu)
create policy "Anyone can insert sensor data" on public.sensor_monitoring
  for insert with check (true);
