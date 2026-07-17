-- Tambahkan izin agar PIC Gedung atau pengguna yang diautentikasi bisa menghapus data permohonan layanan
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.requests;
CREATE POLICY "Enable delete for authenticated users" 
ON public.requests 
FOR DELETE 
USING (auth.role() = 'authenticated');
