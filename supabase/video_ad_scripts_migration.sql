-- Stores AI-generated video ad scripts (the foundation for the Video Ad
-- Generator feature — we generate a script/storyboard today, and will wire
-- up real video generation against this same table once that API is ready).
CREATE TABLE IF NOT EXISTS video_ad_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_title text NOT NULL,
  ad_angle text NOT NULL,
  format text NOT NULL,
  style text NOT NULL,
  duration text NOT NULL,
  script text NOT NULL,
  scenes jsonb NOT NULL,
  voiceover text NOT NULL,
  music_suggestion text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE video_ad_scripts ENABLE ROW LEVEL SECURITY;

-- Row inserts happen server-side via the service-role client (bypasses
-- RLS, mirrors the generated_ads pattern), but a future scripts gallery
-- would read/delete directly from the browser, so real policies + grants
-- are set up now even though nothing reads this table yet.

DROP POLICY IF EXISTS "Users can view their own video ad scripts" ON video_ad_scripts;
CREATE POLICY "Users can view their own video ad scripts"
ON video_ad_scripts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own video ad scripts" ON video_ad_scripts;
CREATE POLICY "Users can delete their own video ad scripts"
ON video_ad_scripts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT, DELETE ON video_ad_scripts TO authenticated;
