-- 1. Create table for landing page configuration
CREATE TABLE public.landing_page_config (
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

-- 2. Insert initial dummy data (so the frontend doesn't crash)
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
    'Selamat Datang di Website Arsip Semen Tonasa',
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
);

-- 3. Set up RLS
ALTER TABLE public.landing_page_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Enable read access for all users on landing_page_config" 
ON public.landing_page_config FOR SELECT 
USING (true);

-- Allow authenticated users to update
CREATE POLICY "Enable update for authenticated users on landing_page_config" 
ON public.landing_page_config FOR UPDATE 
USING (true)
WITH CHECK (true);
