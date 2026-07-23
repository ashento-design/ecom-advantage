-- Per-user email preferences (weekly digest, breakout alerts).
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_preferences jsonb NOT NULL
  DEFAULT '{"weekly_digest": true, "breakout_alerts": false}'::jsonb;

-- Tracks whether a breakout alert has already gone out for a product so
-- crossing the view threshold doesn't re-trigger an email on every
-- subsequent view.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS breakout_alert_sent boolean NOT NULL DEFAULT false;
