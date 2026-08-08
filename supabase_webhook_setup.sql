-- ========================================================
-- SETUP DATABASE WEBHOOK FOR PUSH NOTIFICATION (AUTOMATION)
-- ========================================================

-- Step 1: Aktifkan extension pg_net (jika belum aktif)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Step 2: Buat fungsi trigger untuk memanggil API test-push secara asynchronous
CREATE OR REPLACE FUNCTION public.send_push_notification_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Menyusun payload dengan data baris baru (NEW)
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', to_jsonb(NEW)
  );

  -- Mengirim HTTP POST request ke server Next.js secara async (tidak menghalangi insert)
  PERFORM net.http_post(
    url := 'https://www.arsiptonasa.my.id/api/test-push',
    body := payload,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );

  RETURN NEW;
END;
$$;

-- Step 3: Pasang trigger pada tabel notifications
DROP TRIGGER IF EXISTS on_new_notification ON public.notifications;
CREATE TRIGGER on_new_notification
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.send_push_notification_trigger();
