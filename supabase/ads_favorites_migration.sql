-- Adds ad-gallery organization: favoriting, free-text tags, and a custom
-- display name (instead of only ever showing the ad angle / product title).
ALTER TABLE generated_ads
  ADD COLUMN IF NOT EXISTS is_favorited boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS custom_name text;

-- The gallery page now lets users toggle favorites, edit tags, and rename
-- ads directly from the browser, which needs an UPDATE policy (previously
-- only SELECT/DELETE existed since nothing was ever edited in place).
DROP POLICY IF EXISTS "Users can update their own generated ads" ON generated_ads;
CREATE POLICY "Users can update their own generated ads"
ON generated_ads FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

GRANT UPDATE ON generated_ads TO authenticated;
