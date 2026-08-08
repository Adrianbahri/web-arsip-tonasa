# Dokumentasi Lengkap Web Arsip PT Semen Tonasa

Dokumentasi ini mencakup penjelasan menyeluruh mengenai teknologi, struktur database, pengaturan sistem, desain, dan panduan deployment dari proyek Web Arsip PT Semen Tonasa.

---

## 1. Teknologi yang Digunakan (Tech Stack)

Aplikasi ini dibangun menggunakan arsitektur modern berbasis React dan dirender oleh Next.js untuk performa dan SEO yang optimal.

### Frontend
- **Framework Utama:** [Next.js](https://nextjs.org/) versi 16.2.10 (App Router).
- **Library UI:** [React](https://react.dev/) versi 19.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) versi 4 (diproses melalui `@tailwindcss/postcss`).
- **Animasi:** [Framer Motion](https://www.framer.com/motion/) untuk transisi dan animasi interaktif.
- **Ikonografi:** [Lucide React](https://lucide.dev/) untuk ikon yang ringan dan konsisten.
- **Tema:** `next-themes` untuk dukungan mode terang/gelap (Light/Dark mode).
- **Visualisasi Data:** `recharts` untuk membuat grafik/dashboard.
- **Lain-lain:** `react-qr-code` untuk pembuatan QR Code dan `xlsx` untuk manajemen file Excel.

### Backend & Database
- **BaaS (Backend as a Service):** [Supabase](https://supabase.com/).
- **Database:** PostgreSQL (terintegrasi di dalam Supabase).
- **Autentikasi:** Supabase Auth terintegrasi langsung dengan database.

---

## 2. Struktur Database (Supabase)

Aplikasi ini menggunakan 3 tabel utama di dalam skema `public` Supabase. Keamanan data dikontrol dengan ketat menggunakan fitur **Row Level Security (RLS)** bawaan PostgreSQL.

### A. Tabel `profiles`
Menyimpan profil pengguna yang mendaftar dan menentukan hak akses (Role-Based Access Control).
- **Kolom Utama:** 
  - `id` (UUID, terhubung ke `auth.users`)
  - `name` (String)
  - `email` (String)
  - `role` (String: `pic_gedung`, `admin_dept`, atau `user`)
  - `approved` (Boolean, default `false`)
- **Fungsi Trigger:** Secara otomatis membuat baris profil baru ketika ada user baru yang mendaftar via Supabase Auth (`handle_new_user`).
- **Keamanan (RLS):** 
  - Pengguna hanya bisa membaca profilnya sendiri (kecuali PIC Gedung yang dapat melihat dan mengubah profil untuk melakukan otorisasi user).

### B. Tabel `archives`
Menyimpan data metadata arsip/dokumen perusahaan.
- **Kolom Utama:** 
  - `kode_klasifikasi`, `jenis_berkas`, `judul_berkas`, `departemen`, `tahun`, dll.
  - `gedung`, `lorong`, `rak` (Kosong sampai disetujui/ACC).
  - `status` (Aktif, Inaktif, Permanen, Dimusnahkan, Menunggu ACC, dll).
  - `link_berkas` (Tautan ke file digital).
- **Keamanan (RLS):** 
  - **Semua user login:** Bisa melihat daftar arsip.
  - **Admin Dept & PIC Gedung:** Bisa menambahkan data arsip baru.
  - **Hanya PIC Gedung:** Bisa melakukan *Update* arsip (memberikan ACC persetujuan lokasi gedung/rak).

### C. Tabel `requests`
Menyimpan data pengajuan peminjaman arsip atau kunjungan.
- **Kolom Utama:** 
  - `user_name`, `type` (Tipe permintaan), `archive_title`, `date`, `purpose`, `status`.
- **Keamanan (RLS):**
  - **Semua user login:** Bisa membuat permintaan baru dan melihat daftar.
  - **Hanya PIC Gedung:** Bisa memperbarui/merespon permintaan (Menerima/Menolak).

---

## 3. Sistem Hak Akses (Role & Peran)

Sistem Web Arsip memiliki 3 tingkatan peran (Role):
1. **User Biasa (`user`)**: Dapat melihat dokumen arsip dan membuat *request* kunjungan/peminjaman.
2. **Admin Departemen (`admin_dept`)**: Dapat mengajukan dokumen arsip baru ke sistem (status "Menunggu ACC").
3. **PIC Gedung / Superadmin (`pic_gedung`)**: Memiliki hak prerogatif untuk menyetujui (ACC) arsip yang masuk, menentukan letak penyimpanan fisik (Gedung, Lorong, Rak), menyetujui peminjaman, serta melakukan validasi (approve) akun pengguna lain.

---

## 4. Pengaturan Sistem (Setup)

Untuk menjalankan proyek ini secara lokal, konfigurasi *Environment Variables* sangat diperlukan.

### File `.env.local`
Buat file `.env.local` di root proyek dan tambahkan dua kunci utama yang didapat dari Dashboard Supabase Anda (Project Settings -> API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### Inisiasi Database
Jalankan file SQL yang tersedia di folder proyek (`supabase_push_subscriptions.sql`, `supabase_harden_new_user.sql`) satu per satu ke dalam menu **SQL Editor** di Dashboard Supabase untuk membuat tabel/setting kebijakan (RLS) dan trigger.

---

## 5. Konsep Desain (UI/UX)

Desain aplikasi ini sangat terinspirasi dari panduan antarmuka *Supabase* yang bersih dan teknikal, yang tertuang dalam dokumentasi `DESIGN.md`:
- **Warna Utama:** Emerald Green (`#3ecf8e`) digunakan eksklusif untuk tombol *Call to Action* (CTA) atau elemen interaktif utama.
- **Warna Dasar:** Skema monokrom, menggunakan putih bersih (`#ffffff`) atau sangat gelap (`#1c1c1c`) tanpa distraksi gradien rumit.
- **Tipografi:** Menggunakan font *Humanist Sans* (seperti Circular, atau Inter sebagai alternatif) yang menampilkan kesan modern, padat, dan sangat bersih untuk membaca data tabular yang banyak.
- **Komponen:** *Rounded corners* (ujung membulat) berukuran kecil (6px - 8px) untuk memberikan kesan rapi (technical feel) tanpa terlihat kekanak-kanakan (pill-shaped).

---

## 6. Panduan Deployment (Vercel)

Karena proyek ini menggunakan Next.js, metode deployment yang paling optimal, mudah, dan direkomendasikan adalah menggunakan **Vercel**. Proyek ini juga telah memiliki file konfigurasi `vercel.json` untuk membantu routing.

### Langkah-langkah Deployment:
1. **Push ke GitHub / GitLab:** Pastikan seluruh kode proyek Anda sudah di-push ke repositori Git.
2. **Buka Vercel:** Login ke [Vercel](https://vercel.com/) dan buat proyek baru (Add New -> Project).
3. **Import Repositori:** Pilih repositori Git dari Web Arsip PT Semen Tonasa.
4. **Konfigurasi Environment Variables:** 
   Di halaman pengaturan deployment Vercel, buka bagian **Environment Variables** dan masukkan `NEXT_PUBLIC_SUPABASE_URL` beserta `NEXT_PUBLIC_SUPABASE_ANON_KEY` sesuai dengan proyek Supabase yang aktif (Production Database).
5. **Deploy:** Klik tombol **Deploy**. Vercel akan otomatis mendeteksi bahwa ini adalah aplikasi Next.js (perintah `npm run build` otomatis dijalankan).
6. **Selesai:** Setelah beberapa menit, aplikasi web Anda akan live dan Vercel akan memberikan domain gratis (misal: `web-arsip-tonasa.vercel.app`).

### Update Otomatis (CI/CD)
Setelah terhubung ke Vercel, setiap kali Anda melakukan `git push` ke *branch* utama (misal: `main` atau `master`), Vercel akan secara otomatis membangun ulang (rebuild) dan memperbarui situs web secara instan.
