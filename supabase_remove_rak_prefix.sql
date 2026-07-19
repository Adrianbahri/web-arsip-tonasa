-- Menghapus kata awalan "Rak " atau "RAK " dari kolom rak di tabel archives
UPDATE public.archives
SET rak = TRIM(REGEXP_REPLACE(rak, '(?i)^Rak\s+', ''))
WHERE rak ILIKE 'Rak %';

-- Menghapus kata awalan "Rak " atau "RAK " dari kolom rak di tabel master_locations
UPDATE public.master_locations
SET rak = TRIM(REGEXP_REPLACE(rak, '(?i)^Rak\s+', ''))
WHERE rak ILIKE 'Rak %';
