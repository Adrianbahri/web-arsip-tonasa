-- ==========================================
-- TABEL PUSH SUBSCRIPTIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email text NOT NULL,
    endpoint text NOT NULL UNIQUE,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Server API (route handler Next.js) memakai anon key tanpa session,
-- jadi akses diizinkan untuk role public/anon agar /api/subscribe,
-- /api/test-push (SELECT) dan pembersihan sensor expired bisa berjalan.
CREATE POLICY "Allow push subscription insert"
ON public.push_subscriptions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow push subscription read"
ON public.push_subscriptions FOR SELECT
USING (true);

CREATE POLICY "Allow push subscription delete"
ON public.push_subscriptions FOR DELETE
USING (true);
