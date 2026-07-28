-- Lets users track products they're actively testing in their own store,
-- moving them through a simple Testing -> Winner/Loser/Paused pipeline.
CREATE TABLE IF NOT EXISTS product_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'testing' CHECK (status IN ('testing', 'winner', 'loser', 'paused')),
  store_url text,
  notes text,
  daily_spend numeric,
  revenue numeric,
  orders integer,
  started_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_tests_user_status ON product_tests (user_id, status);

ALTER TABLE product_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own product tests" ON product_tests;
CREATE POLICY "Users can view their own product tests"
ON product_tests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own product tests" ON product_tests;
CREATE POLICY "Users can insert their own product tests"
ON product_tests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own product tests" ON product_tests;
CREATE POLICY "Users can update their own product tests"
ON product_tests FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own product tests" ON product_tests;
CREATE POLICY "Users can delete their own product tests"
ON product_tests FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON product_tests TO authenticated;
