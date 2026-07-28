-- Lets users curate named lists of products and optionally share them
-- publicly via a slug-based URL (/collections/[slug]).
-- creator_name is denormalized onto the row at creation time (rather than
-- joined from `profiles` at read time) because `profiles` RLS only allows a
-- user to read their own row — an anonymous visitor to a public collection
-- page has no way to look up another user's name otherwise.
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  slug text NOT NULL UNIQUE,
  is_public boolean NOT NULL DEFAULT false,
  product_ids uuid[] NOT NULL DEFAULT '{}',
  creator_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collections_user ON collections (user_id);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections (slug);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view their own collections" ON collections;
CREATE POLICY "Owners can view their own collections"
ON collections FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view public collections" ON collections;
CREATE POLICY "Anyone can view public collections"
ON collections FOR SELECT
TO anon, authenticated
USING (is_public = true);

DROP POLICY IF EXISTS "Owners can insert their own collections" ON collections;
CREATE POLICY "Owners can insert their own collections"
ON collections FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can update their own collections" ON collections;
CREATE POLICY "Owners can update their own collections"
ON collections FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can delete their own collections" ON collections;
CREATE POLICY "Owners can delete their own collections"
ON collections FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT ON collections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON collections TO authenticated;
