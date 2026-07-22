-- Tracks Pro-gated ad-image generation usage
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ads_generated integer NOT NULL DEFAULT 0;

-- Stores every DALL-E-generated ad creative
CREATE TABLE IF NOT EXISTS generated_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  ad_angle text NOT NULL,
  format text NOT NULL,
  style text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE generated_ads ENABLE ROW LEVEL SECURITY;

-- Row inserts happen server-side via the service-role client (bypasses
-- RLS), but the gallery page reads/deletes directly from the browser,
-- so those need real policies + grants (own rows only).

DROP POLICY IF EXISTS "Users can view their own generated ads" ON generated_ads;
CREATE POLICY "Users can view their own generated ads"
ON generated_ads FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own generated ads" ON generated_ads;
CREATE POLICY "Users can delete their own generated ads"
ON generated_ads FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT, DELETE ON generated_ads TO authenticated;
