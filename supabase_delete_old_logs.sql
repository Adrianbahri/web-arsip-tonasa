-- =========================================================================
-- SQL SCRIPT UNTUK MENGHAPUS LOG AUDIT SECARA OTOMATIS SETELAH 30 HARI
-- =========================================================================

-- OPSI 1: Hapus log yang sudah lewat 30 hari SECARA MANUAL SEKARANG
-- Anda bisa menjalankan perintah ini kapan saja untuk membersihkan database
DELETE FROM public.audit_logs 
WHERE created_at < NOW() - INTERVAL '30 days';

-- =========================================================================
-- OPSI 2: JADWALKAN OTOMATIS DENGAN PG_CRON (Direkomendasikan)
-- Eksekusi otomatis setiap jam 12 malam (00:00)
-- Pastikan ekstensi pg_cron sudah diaktifkan di Database > Extensions (Supabase)
-- =========================================================================

-- Aktifkan ekstensi pg_cron (jika belum)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Buat penjadwalan (cron job) untuk menghapus log lebih dari 30 hari
SELECT cron.schedule(
  'hapus-log-30-hari',     -- Nama cron job
  '0 0 * * *',             -- Jadwal: Setiap jam 00:00 (tengah malam)
  $$ DELETE FROM public.audit_logs WHERE created_at < NOW() - INTERVAL '30 days' $$
);

-- =========================================================================
-- Jika suatu saat Anda ingin membatalkan penjadwalan otomatis ini:
-- SELECT cron.unschedule('hapus-log-30-hari');
-- =========================================================================
