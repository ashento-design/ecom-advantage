-- Creates a public storage bucket for product images and generated ad
-- creatives. Uploads happen server-side (app/api/upload/route.ts,
-- app/api/generate-ad/route.ts) using the service-role key, which
-- bypasses storage RLS entirely — the only policy needed is public
-- read access so the resulting image URLs work in <img> tags.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read access for product-images" on storage.objects;
create policy "Public read access for product-images"
on storage.objects for select
to public
using (bucket_id = 'product-images');
