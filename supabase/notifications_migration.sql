-- In-app notifications shown from the navbar bell.
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('new_product', 'breakout', 'referral_reward', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications (user_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

GRANT SELECT, UPDATE ON notifications TO authenticated;

-- Seed 2-3 sample notifications for every existing user so the feature is
-- visible immediately instead of starting empty for everyone.
INSERT INTO notifications (user_id, type, title, message)
SELECT id, 'system', 'Welcome to Launchory notifications', 'You''ll see updates here about new products, breakout alerts, and referral rewards.'
FROM profiles;

INSERT INTO notifications (user_id, type, title, message)
SELECT id, 'new_product', 'New products just dropped', '15+ new winning products were added to your feed today.'
FROM profiles;

INSERT INTO notifications (user_id, type, title, message)
SELECT id, 'referral_reward', 'Refer & Earn is live', 'Refer 3 friends who upgrade to Pro and get 1 month free. Grab your link from the navbar menu.'
FROM profiles;
