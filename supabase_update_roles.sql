-- =========================================================================
-- SQL SCRIPT UNTUK MEMPERBARUI STRUKTUR ROLE (MENAMBAHKAN SUPERADMIN)
-- =========================================================================

-- 1. Perbarui Constraint Role di Tabel Profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role in ('superadmin', 'pic_gedung', 'admin_dept', 'user'));


-- 2. Perbarui Policy Insert di Tabel Archives
DROP POLICY IF EXISTS "Admins can insert archives" ON public.archives;
CREATE POLICY "Admins can insert archives" ON public.archives
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('superadmin', 'pic_gedung', 'admin_dept')
    )
  );

-- 3. Perbarui Policy Update di Tabel Archives
DROP POLICY IF EXISTS "Only PIC Gedung can update archives" ON public.archives;
CREATE POLICY "Only PIC Gedung can update archives" ON public.archives
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('superadmin', 'pic_gedung')
    )
  );


-- 4. Perbarui Policy Update di Tabel Requests
DROP POLICY IF EXISTS "Only PIC Gedung can update requests" ON public.requests;
CREATE POLICY "Only PIC Gedung can update requests" ON public.requests
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('superadmin', 'pic_gedung')
    )
  );


-- 5. Perbarui Fungsi Bypass RLS is_pic_gedung() agar Superadmin juga mendapat akses admin
CREATE OR REPLACE FUNCTION public.is_pic_gedung()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('superadmin', 'pic_gedung')
  );
$$
LANGUAGE sql SECURITY definer;
