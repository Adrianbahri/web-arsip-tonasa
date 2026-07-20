-- ========================================================
-- TABEL JADWAL RETENSI ARSIP (JRA)
-- ========================================================
create table if not exists public.master_retensi (
  id uuid default gen_random_uuid() primary key,
  kategori text not null unique,
  masa_aktif_tahun integer not null default 5,
  masa_inaktif_tahun integer not null default 5,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mengaktifkan Row Level Security (RLS) pada tabel master_retensi
alter table public.master_retensi enable row level security;

-- Policy RLS untuk tabel master_retensi:
-- 1. Semua user dapat membaca aturan retensi
drop policy if exists "Enable read access for all users on master_retensi" on public.master_retensi;
create policy "Enable read access for all users on master_retensi" 
on public.master_retensi for select using (true);

-- 2. Hanya Superadmin dan PIC Gedung yang dapat mengubah data retensi
drop policy if exists "Enable insert for admins on master_retensi" on public.master_retensi;
create policy "Enable insert for admins on master_retensi" 
on public.master_retensi for insert to authenticated 
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() 
    and profiles.role in ('superadmin', 'pic_gedung')
  )
);

drop policy if exists "Enable update for admins on master_retensi" on public.master_retensi;
create policy "Enable update for admins on master_retensi" 
on public.master_retensi for update to authenticated 
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() 
    and profiles.role in ('superadmin', 'pic_gedung')
  )
);

drop policy if exists "Enable delete for admins on master_retensi" on public.master_retensi;
create policy "Enable delete for admins on master_retensi" 
on public.master_retensi for delete to authenticated 
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() 
    and profiles.role in ('superadmin', 'pic_gedung')
  )
);

-- Masukkan data dummy awal
insert into public.master_retensi (kategori, masa_aktif_tahun, masa_inaktif_tahun)
values 
('Surat Keputusan', 5, 5),
('Kontrak Perjanjian', 2, 3),
('Laporan Keuangan', 3, 7)
on conflict (kategori) do nothing;
