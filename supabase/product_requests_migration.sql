-- Lets users suggest products they want researched and added to the feed.

CREATE TABLE IF NOT EXISTS product_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  product_url text,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;

-- Submission happens client-side (own row only). Admin review reads/updates
-- go through the service-role client in /api/admin/requests, which bypasses
-- RLS entirely, so no admin-facing policy is needed here.

DROP POLICY IF EXISTS "Users can view their own product requests" ON product_requests;
CREATE POLICY "Users can view their own product requests"
ON product_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own product requests" ON product_requests;
CREATE POLICY "Users can insert their own product requests"
ON product_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON product_requests TO authenticated;
