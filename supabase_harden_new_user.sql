-- ========================================================
-- HARDEN NEW USER TRIGGER
-- Jalankan di Supabase SQL Editor. Memaksa akun baru selalu role=user, approved=false
-- Walaupun client mengirim metadata role/approved palsu.
-- ========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, role, approved)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'user',   -- role TIDAK pernah diambil dari metadata client
    false     -- approved TIDAK pernah diambil dari metadata client
  );
  return new;
end;
$$;