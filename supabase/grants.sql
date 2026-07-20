-- Fix: RLS is enabled on `profiles` but the `authenticated` role has no
-- table-level GRANTs, so every query (signup insert, paywall lookup,
-- account page) fails with "permission denied for table profiles" (42501)
-- even though RLS policies would otherwise allow it.
--
-- Run this in the Supabase SQL editor.

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- saved_products and ai_analyses are also RLS-enabled and used by
-- authenticated users (bookmarking, analysis history) — verify they
-- have the equivalent grants, or run these too:
GRANT SELECT, INSERT, DELETE ON public.saved_products TO authenticated;
GRANT SELECT, INSERT ON public.ai_analyses TO authenticated;
