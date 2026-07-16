# Panduan Integrasi Supabase: Autentikasi & CRUD Arsip Tonasa

Panduan ini menjelaskan langkah demi langkah untuk menyambungkan aplikasi frontend Next.js ini ke proyek **Supabase** Anda agar fitur Login, Hak Akses (RBAC), Pengajuan Berkas, dan Persetujuan (ACC) berfungsi secara nyata dengan database.

---

## 1. Setup Environment Variables
Buat file baru bernama `.env.local` di direktori utama proyek (`/Users/adrian/Documents/IT/WEB ARSIP/.env.local`), lalu masukkan URL dan Anon Key dari dashboard Supabase Anda (Settings > API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx-your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. Struktur Schema Database (SQL)
Jalankan perintah SQL berikut di **Supabase SQL Editor** untuk membuat tabel profil user (untuk menyimpan role) dan tabel arsip dokumen:

```sql
-- ========================================================
-- 1. TABEL PROFIL USER (Menyimpan Role RBAC)
-- ========================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  role text not null check (role in ('pic_gedung', 'admin_dept', 'user')),
  approved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mengaktifkan Row Level Security (RLS) pada tabel profiles
alter table public.profiles enable row level security;

-- Policy agar user dapat membaca profil mereka sendiri
create policy "User can read own profile" on public.profiles
  for select using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, approved)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user'), -- Default role jika tidak ditentukan
    coalesce((new.raw_user_meta_data->>'approved')::boolean, false)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ========================================================
-- 2. TABEL ARSIP BERKAS (Metadata Dokumen)
-- ========================================================
create table public.archives (
  id uuid default gen_random_uuid() primary key,
  no serial, -- Untuk nomor urut otomatis
  kode_klasifikasi text not null,
  jenis_berkas text not null,
  judul_berkas text not null,
  departemen text not null,
  tahun text not null,
  tanggal_terima text not null,
  jangka_waktu text not null,
  gedung text, -- Kosong jika belum di-ACC
  lorong text, -- Kosong jika belum di-ACC
  rak text,    -- Kosong jika belum di-ACC
  keterangan text,
  isi_bundel text, -- Disimpan sebagai JSON array string
  status text not null check (status in ('Aktif', 'Inaktif', 'Permanen', 'Dinilai Kembali', 'Ditinjau Kembali', 'Upaya Pemusnahan', 'Dimusnahkan', 'Menunggu ACC', 'Ditolak')),
  link_berkas text not null,
  created_by uuid references auth.users on delete set null default auth.uid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mengaktifkan Row Level Security (RLS) pada tabel archives
alter table public.archives enable row level security;

-- Policy RLS untuk tabel archives:
-- 1. Semua user terautentikasi dapat melihat berkas
create policy "Authenticated users can select archives" on public.archives
  for select to authenticated using (true);

-- 2. Admin Dept dan PIC Gedung dapat mengajukan berkas
create policy "Admins can insert archives" on public.archives
  for insert to authenticated with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() 
      and profiles.role in ('pic_gedung', 'admin_dept')
    )
  );

-- 3. Hanya PIC Gedung yang dapat mengupdate (memberikan ACC / lokasi rak)
create policy "Only PIC Gedung can update archives" on public.archives
  for update to authenticated using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() 
      and profiles.role = 'pic_gedung'
    )
  );
```

---

-- ========================================================
-- 3. TABEL REQUESTS (Layanan Peminjaman & Kunjungan)
-- ========================================================
create table public.requests (
  id uuid default gen_random_uuid() primary key,
  user_name text not null,
  type text not null,
  archive_title text,
  date text not null,
  time_or_return text not null,
  purpose text not null,
  link_surat text,
  reject_reason text,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.requests enable row level security;

create policy "Authenticated users can select requests" on public.requests
  for select to authenticated using (true);

create policy "Authenticated users can insert requests" on public.requests
  for insert to authenticated using (true);

create policy "Only PIC Gedung can update requests" on public.requests
  for update to authenticated using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() 
      and profiles.role = 'pic_gedung'
    )
  );


-- Policy agar PIC Gedung dapat melihat semua profil

-- Policy agar SEMUA user yang login dapat membaca profil (Mencegah Infinite Recursion)
create policy "All authenticated users can read profiles" on public.profiles
  for select to authenticated using (true);

-- Fungsi bypass RLS untuk mengecek apakah user adalah PIC Gedung
create or replace function public.is_pic_gedung()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'pic_gedung'
  );
$$
language sql security definer;

-- Policy agar PIC Gedung dapat mengupdate profil
create policy "PIC Gedung can update profiles" on public.profiles
  for update to authenticated using (public.is_pic_gedung());
