-- Stores past Store Intelligence analyses so users can revisit them.
CREATE TABLE IF NOT EXISTS store_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_url text NOT NULL,
  store_name text,
  analysis_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_store_analyses_user_created ON store_analyses (user_id, created_at DESC);

ALTER TABLE store_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own store analyses" ON store_analyses;
CREATE POLICY "Users can view their own store analyses"
ON store_analyses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own store analyses" ON store_analyses;
CREATE POLICY "Users can insert their own store analyses"
ON store_analyses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON store_analyses TO authenticated;
