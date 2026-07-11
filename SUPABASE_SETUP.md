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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mengaktifkan Row Level Security (RLS) pada tabel profiles
alter table public.profiles enable row level security;

-- Policy agar user dapat membaca profil mereka sendiri
create policy "User can read own profile" on public.profiles
  for select using (auth.uid() = id);

-- Trigger otomatis untuk membuat baris profil baru saat user mendaftar di auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user') -- Default role jika tidak ditentukan
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
  status text not null check (status in ('Aktif', 'Inaktif', 'Permanen', 'Dinilai Kembali', 'Ditinjau Kembali', 'Upaya Pemusnahan', 'Dimusnahkan', 'Menunggu ACC', 'Ditolak')),
  link_berkas text not null,
  created_by uuid references auth.users default auth.uid(),
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

## 3. Integrasi Kode Frontend

### A. Sambungkan Auth (`src/components/RoleContext.tsx`)
Ganti fungsi `login` dan `logout` simulasi dengan Supabase Auth Client:

```typescript
import { supabase } from "@/lib/supabase";

// Di dalam RoleProvider:
const login = async (email: string, selectedRole: Role): Promise<boolean> => {
   // Dalam produksi asli, Supabase Auth akan memverifikasi password:
   // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
   
   // Contoh implementasi bypass password untuk demo tapi mencatat ke Supabase Auth:
   const { data, error } = await supabase.auth.signInWithOtp({ email });
   
   if (error) return false;
   return true;
};

const logout = async () => {
   await supabase.auth.signOut();
   setUser(null);
   router.push("/login");
};
```

### B. Hubungkan CRUD Tabel (`src/app/dashboard/page.tsx`)

#### 1. Membaca Data (*READ*):
Ganti `initialArchives` statis dengan fungsi fetch ke database:

```typescript
const fetchArchives = async () => {
  const { data, error } = await supabase
    .from('archives')
    .select('*')
    .order('no', { ascending: true });
    
  if (data) {
     setArchives(data);
  }
};

useEffect(() => {
  fetchArchives();
}, []);
```

#### 2. Menambahkan Pengajuan (*CREATE*):
Ganti fungsi `handleSubmit` pada form untuk menyimpan langsung ke database Supabase:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   
   const newRecord = {
      kode_klasifikasi: formData.kodeKlasifikasi,
      jenis_berkas: formData.jenisBerkas,
      judul_berkas: formData.judulBerkas,
      departemen: role === 'admin_dept' ? 'KEUANGAN' : formData.departemen,
      tahun: formData.tahun,
      tanggal_terima: formData.tanggalTerima,
      jangka_waktu: formData.jangkaWaktu,
      gedung: role === 'pic_gedung' ? formData.gedung : null,
      lorong: role === 'pic_gedung' ? formData.lorong : null,
      rak: role === 'pic_gedung' ? formData.rak : null,
      status: role === 'pic_gedung' ? "Aktif" : "Menunggu ACC",
      link_berkas: formData.linkBerkas
   };

   const { error } = await supabase
      .from('archives')
      .insert([newRecord]);

   if (!error) {
      setSuccessMessage("Berkas berhasil disimpan!");
      fetchArchives(); // Refresh tabel
      setShowAddForm(false);
   }
};
```

#### 3. Memberikan ACC & Lokasi Fisik (*UPDATE*):
Ganti fungsi `submitApproval` untuk melakukan update status ke Supabase:

```typescript
const submitApproval = async (e: React.FormEvent) => {
   e.preventDefault();
   
   const { error } = await supabase
      .from('archives')
      .update({
         gedung: approvalLocation.gedung,
         lorong: approvalLocation.lorong,
         rak: approvalLocation.rak,
         status: "Aktif"
      })
      .eq('id', selectedApprovalId); // Menggunakan UUID

   if (!error) {
      setSuccessMessage("Berkas berhasil di-ACC!");
      fetchArchives(); // Refresh tabel
      setSelectedApprovalId(null);
   }
};
```
