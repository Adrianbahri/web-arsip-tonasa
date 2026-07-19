-- Menambahkan kolom "baris" ke tabel archives jika belum ada
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='archives' AND column_name='baris') THEN
        ALTER TABLE public.archives ADD COLUMN baris text;
    END IF;
END $$;

-- Menambahkan kolom "baris" ke tabel master_locations jika belum ada
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='master_locations' AND column_name='baris') THEN
        ALTER TABLE public.master_locations ADD COLUMN baris text;
    END IF;
END $$;

-- Migrasi Data Lama
-- Memisahkan format "Rak A Baris 1" menjadi rak = "Rak A" dan baris = "1", atau cukup menghapus kata Baris dll.
-- Jika formatnya "Rak X Baris Y", maka:
UPDATE public.archives
SET 
    baris = TRIM(SUBSTRING(rak FROM '(?i)Baris\s+(.*)')),
    rak = TRIM(REGEXP_REPLACE(rak, '(?i)\s*Baris\s+.*', ''))
WHERE rak ILIKE '%Baris%';
