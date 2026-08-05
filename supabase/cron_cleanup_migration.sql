-- Tracks every real (non-dry-run) invocation of /api/cron/master. This is
-- what makes the daily/weekly digest steps idempotent: before sending, the
-- master cron checks this table for a row already covering today/this week
-- instead of trusting that it will only ever be invoked once. Also gives
-- visibility into what the cron actually did on each run.
CREATE TABLE IF NOT EXISTS cron_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at timestamptz NOT NULL DEFAULT now(),
  onboarding_sent integer NOT NULL DEFAULT 0,
  daily_sent integer NOT NULL DEFAULT 0,
  weekly_sent integer NOT NULL DEFAULT 0,
  errors text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cron_runs_run_at ON cron_runs (run_at DESC);

ALTER TABLE cron_runs ENABLE ROW LEVEL SECURITY;
-- Written and read only by the service-role client (the master cron route),
-- never directly by the browser — no anon/authenticated policies needed.
