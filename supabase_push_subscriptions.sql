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

-- Policy: User bisa insert subscription mereka sendiri
CREATE POLICY "Users can insert their own subscriptions"
ON public.push_subscriptions FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: User bisa baca subscription mereka sendiri
CREATE POLICY "Users can view subscriptions"
ON public.push_subscriptions FOR SELECT
TO authenticated
USING (true);

-- Policy: User bisa hapus
CREATE POLICY "Users can delete subscriptions"
ON public.push_subscriptions FOR DELETE
TO authenticated
USING (true);
