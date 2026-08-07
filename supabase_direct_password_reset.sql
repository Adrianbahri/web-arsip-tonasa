-- ========================================================
-- POSTGRES FUNCTION TO RESET USER PASSWORD BY ADMIN
-- ========================================================

-- This function allows a superadmin to directly reset a user's password
-- without sending a recovery email.

CREATE OR REPLACE FUNCTION public.admin_reset_password(user_email text, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Ensure caller is a superadmin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  ) THEN
    RAISE EXCEPTION 'Not authorized to reset passwords';
  END IF;

  -- 2. Update the user's encrypted password using pgcrypto
  -- Supabase Auth uses bcrypt, which is supported by pgcrypto's crypt() function with gen_salt('bf')
  UPDATE auth.users 
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE email = user_email;
  
  -- Throw an error if no user was found to update
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;
