-- 1. Create a new public bucket for landing page assets
insert into storage.buckets (id, name, public)
values ('landing_assets', 'landing_assets', true)
on conflict (id) do nothing;

-- 2. Allow public access to view/download files
create policy "landing_assets_public_read"
on storage.objects for select
using ( bucket_id = 'landing_assets' );

-- 3. Allow authenticated users to upload files
create policy "landing_assets_auth_insert"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'landing_assets' );

-- 4. Allow authenticated users to update their files
create policy "landing_assets_auth_update"
on storage.objects for update
to authenticated
using ( bucket_id = 'landing_assets' );

-- 5. Allow authenticated users to delete files
create policy "landing_assets_auth_delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'landing_assets' );
