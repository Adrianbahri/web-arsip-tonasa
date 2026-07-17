-- Tambahkan kolom deleted_at untuk fitur Soft Delete (Recycle Bin)
ALTER TABLE public.archives ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone DEFAULT NULL;
