-- Tracks which onboarding drip-sequence emails (1-5) each user has already
-- received. There's no job queue, so the daily cron in
-- /api/cron/onboarding-emails scans profiles by signup age and uses this
-- table to avoid re-sending an email a user already got.

CREATE TABLE IF NOT EXISTS onboarding_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_number smallint NOT NULL CHECK (email_number BETWEEN 1 AND 5),
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, email_number)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_emails_number ON onboarding_emails (email_number);

ALTER TABLE onboarding_emails ENABLE ROW LEVEL SECURITY;
-- Written only by the service-role client (welcome-email route + the
-- onboarding-emails cron), never directly by the browser — no
-- anon/authenticated policies are needed.
