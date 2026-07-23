-- Fix: service_role has no table-level GRANTs on the public schema in
-- this project. service_role is supposed to bypass RLS and have full
-- access by default in Supabase, but this project's role privileges
-- were apparently never set up that way — every getServiceRoleClient()
-- call in the app (admin panel, ad generator, view tracking, Stripe
-- webhook) has been silently failing at the database step with
-- "permission denied for table X" (42501), independent of RLS policies.
--
-- Confirmed live via direct REST calls with the service-role key on
-- 2026-07-23: products, profiles, generated_ads, ai_analyses, and
-- saved_products all returned 403 for a plain SELECT using service_role.
--
-- This is what let the ad generator's DALL-E call fail before ever
-- reaching these tables — once that's fixed, this grant is what makes
-- the generated_ads insert and profiles.ads_generated update actually
-- persist instead of silently failing (the API route already tolerates
-- those failures without breaking the response, but they should work).

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
