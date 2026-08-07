-- ==========================================
-- 1. BAGIAN: KONFIGURASI LANDING PAGE
-- ==========================================

-- Buat tabel untuk menyimpan pengaturan landing page
CREATE TABLE IF NOT EXISTS public.landing_page_config (
    id text PRIMARY KEY,
    hero_title text NOT NULL,
    hero_subtitle text NOT NULL,
    hero_image_url text NOT NULL,
    sambutan_title text NOT NULL,
    sambutan_text text NOT NULL,
    sambutan_photo_url text NOT NULL,
    sop_title text NOT NULL,
    sop_text text NOT NULL,
    pic_title text NOT NULL,
    pic_text text NOT NULL,
    pic_photo_url text NOT NULL,
    pic_whatsapp text NOT NULL,
    pic_email text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Masukkan data awal (dummy) agar website tidak error saat pertama kali dibuka
INSERT INTO public.landing_page_config (
    id, 
    hero_title, 
    hero_subtitle, 
    hero_image_url, 
    sambutan_title, 
    sambutan_text, 
    sambutan_photo_url, 
    sop_title, 
    sop_text, 
    pic_title, 
    pic_text, 
    pic_photo_url, 
    pic_whatsapp, 
    pic_email
) VALUES (
    'homepage',
    'Selamat Datang di Web Arsip PT Semen Tonasa',
    'Portal informasi, mekanisme pengarsipan dokumen fisik & digital PT Semen Tonasa secara terintegrasi dan aman.',
    '/hero-image.jpg',
    'Sambutan',
    'PT Semen Tonasa berkomitmen untuk mengelola seluruh dokumen penting perusahaan secara profesional dan terstruktur. Website Arsip ini hadir sebagai sarana integrasi bagi seluruh departemen untuk mengarsipkan dokumen penting secara aman, efisien, dan sesuai dengan standar tata kelola arsip nasional. Dengan digitalisasi dokumen, penemuan kembali arsip menjadi lebih cepat, aman, dan dapat diakses dengan mudah oleh unit kerja yang berwenang.',
    '',
    'Prosedur Penyerahan & Pengelolaan Arsip Inaktif',
    'Tahapan standar tata kelola pemindahan berkas dari unit kerja departemen ke unit kearsipan gedung.',
    'PIC Gedung Arsip',
    'Pengelolaan fisik arsip, penentuan rak, lorong, dan verifikasi dokumen masuk dikelola langsung oleh PIC Gedung Arsip. Bagi unit kerja atau departemen yang membutuhkan koordinasi serah terima dokumen fisik atau akses darurat, silakan hubungi PIC melalui kontak resmi di bawah ini:',
    '',
    '#',
    'mailto:arsip@sementonasa.co.id'
) ON CONFLICT (id) DO NOTHING;

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.landing_page_config ENABLE ROW LEVEL SECURITY;

-- Izinkan semua orang (publik) untuk membaca data Landing Page
DROP POLICY IF EXISTS "Enable read access for all users on landing_page_config" ON public.landing_page_config;
CREATE POLICY "Enable read access for all users on landing_page_config" 
ON public.landing_page_config FOR SELECT 
USING (true);

-- Izinkan pengguna yang sudah login (Admin/PIC) untuk memperbarui data
DROP POLICY IF EXISTS "Enable update for authenticated users on landing_page_config" ON public.landing_page_config;
CREATE POLICY "Enable update for authenticated users on landing_page_config" 
ON public.landing_page_config FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- ==========================================
-- 2. BAGIAN: PERBAIKAN TOMBOL HAPUS (LAYANAN ARSIP)
-- ==========================================

-- Tambahkan izin agar pengguna yang sudah masuk (Admin/PIC Gedung) bisa menghapus permohonan layanan
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.requests;
CREATE POLICY "Enable delete for authenticated users" 
ON public.requests 
FOR DELETE 
USING (auth.role() = 'authenticated');
