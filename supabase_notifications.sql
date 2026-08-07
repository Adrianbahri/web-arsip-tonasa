-- ==========================================
-- TABEL NOTIFICATIONS (Notifikasi Real-time)
-- ==========================================

-- Buat tabel notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL DEFAULT 'general',
    reference_id text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Semua user yang login bisa membaca notifikasi
CREATE POLICY "Authenticated users can read notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (true);

-- Semua user yang login bisa membuat notifikasi (untuk trigger otomatis)
CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Semua user yang login bisa menghapus notifikasi
CREATE POLICY "Authenticated users can delete notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- AKTIFKAN REALTIME AGAR NOTIFIKASI LIVE
-- ==========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
