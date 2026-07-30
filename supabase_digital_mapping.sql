-- Buat tabel untuk menyimpan master data digital mapping
CREATE TABLE IF NOT EXISTS public.master_digital_mapping (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    gedung text NOT NULL,
    deskripsi text NOT NULL,
    map_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Izinkan RLS
ALTER TABLE public.master_digital_mapping ENABLE ROW LEVEL SECURITY;

-- Policy untuk read (public read diperbolehkan agar bisa diakses oleh siapa saja saat scan QR)
DROP POLICY IF EXISTS "Enable read access for all users on master_digital_mapping" ON public.master_digital_mapping;
CREATE POLICY "Enable read access for all users on master_digital_mapping"
ON public.master_digital_mapping FOR SELECT
USING (true);

-- Policy untuk insert/update/delete hanya untuk admin (authenticated)
DROP POLICY IF EXISTS "Enable insert for authenticated users on master_digital_mapping" ON public.master_digital_mapping;
CREATE POLICY "Enable insert for authenticated users on master_digital_mapping"
ON public.master_digital_mapping FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users on master_digital_mapping" ON public.master_digital_mapping;
CREATE POLICY "Enable update for authenticated users on master_digital_mapping"
ON public.master_digital_mapping FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users on master_digital_mapping" ON public.master_digital_mapping;
CREATE POLICY "Enable delete for authenticated users on master_digital_mapping"
ON public.master_digital_mapping FOR DELETE
USING (auth.role() = 'authenticated');

-- =====================================
-- PENTING UNTUK FITUR PENCARIAN PUBLIK:
-- =====================================
-- Agar fitur pencarian arsip dapat digunakan secara publik (tanpa login),
-- kita perlu memastikan tabel archives bisa dibaca (SELECT) oleh publik,
-- ATAU pastikan pencarian arsip publik hanya menampilkan metadata terbatas.
-- Saat ini kita akan izinkan SELECT read-only untuk publik pada archives.

DROP POLICY IF EXISTS "Enable read access for all users on archives" ON public.archives;
CREATE POLICY "Enable read access for all users on archives"
ON public.archives FOR SELECT
USING (true);
