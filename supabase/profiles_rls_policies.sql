-- Fix: new user signups cannot create their profiles row.
--
-- profiles has RLS enabled and (from an earlier migration) the
-- `authenticated` role has table-level GRANTs, but there is no RLS
-- POLICY allowing a user to INSERT their own row — Postgres requires
-- both a GRANT and a passing policy. Without an INSERT policy, RLS
-- defaults to denying all inserts, which is exactly the
-- "new row violates row-level security policy for table \"profiles\""
-- error seen during signup testing.
--
-- This replaces (via DROP + CREATE, safe to re-run) the policies with
-- a consistent "own row only" set for select/insert/update.

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
