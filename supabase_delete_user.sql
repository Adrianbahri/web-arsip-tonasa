-- ========================================================
-- POSTGRES FUNCTION TO DELETE USER AND REASSIGN DATA
-- ========================================================

-- This function deletes a user securely from auth.users (which cascades to profiles)
-- and reassigns any linked archives to the superadmin before deletion.

CREATE OR REPLACE FUNCTION public.delete_user_and_reassign(user_to_delete uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_superadmin_id uuid;
BEGIN
  -- 1. Ensure caller is a superadmin or pic_gedung
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('superadmin', 'pic_gedung')
  ) THEN
    RAISE EXCEPTION 'Not authorized to delete users';
  END IF;

  -- 2. Find an active superadmin ID to reassign data to
  SELECT id INTO v_superadmin_id 
  FROM public.profiles 
  WHERE role = 'superadmin' 
  LIMIT 1;

  IF v_superadmin_id IS NULL THEN
    RAISE EXCEPTION 'No superadmin found to reassign data';
  END IF;

  -- 3. Reassign archives created by the deleted user to the superadmin
  UPDATE public.archives 
  SET created_by = v_superadmin_id 
  WHERE created_by = user_to_delete;

  -- (You can add more UPDATE statements here if there are other tables tied to the user)

  -- 4. Delete the user from auth.users 
  -- Note: Because profiles.id references auth.users(id) ON DELETE CASCADE,
  -- this will automatically remove their row from public.profiles as well.
  DELETE FROM auth.users WHERE id = user_to_delete;

END;
$$;
