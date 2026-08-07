-- ========================================================
-- TABEL NOTIFIKASI
-- ========================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL, -- 'archive_submission', 'service_request'
    reference_id text, -- ID of the archive or request
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Only PIC Gedung and Superadmin can select and delete notifications
-- We broadcast to all pic_gedung. So anyone with role pic_gedung or superadmin can see them.
CREATE POLICY "Enable read for PIC Gedung" ON public.notifications
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('pic_gedung', 'superadmin')
        )
    );

CREATE POLICY "Enable delete for PIC Gedung" ON public.notifications
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('pic_gedung', 'superadmin')
        )
    );

-- Trigger for New Archives (status 'Menunggu ACC')
CREATE OR REPLACE FUNCTION public.notify_new_archive()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Menunggu ACC' THEN
        INSERT INTO public.notifications (title, message, type, reference_id)
        VALUES (
            'Pengajuan Arsip Baru',
            'Terdapat pengajuan arsip baru (' || NEW.judul_berkas || ') dari departemen ' || NEW.departemen || ' yang menunggu persetujuan (ACC).',
            'archive_submission',
            NEW.id::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_archive_inserted ON public.archives;
CREATE TRIGGER on_archive_inserted
    AFTER INSERT ON public.archives
    FOR EACH ROW EXECUTE PROCEDURE public.notify_new_archive();


-- Trigger for New Requests (Layanan Arsip)
CREATE OR REPLACE FUNCTION public.notify_new_request()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (title, message, type, reference_id)
    VALUES (
        'Permintaan Layanan Arsip',
        'Terdapat permohonan ' || NEW.type || ' baru dari ' || NEW.user_name || '.',
        'service_request',
        NEW.id::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_request_inserted ON public.requests;
CREATE TRIGGER on_request_inserted
    AFTER INSERT ON public.requests
    FOR EACH ROW EXECUTE PROCEDURE public.notify_new_request();
