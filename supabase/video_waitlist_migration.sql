-- Waitlist for the (not yet built) Video Ad Generator feature — just
-- enough to gauge interest before investing in building it.
CREATE TABLE IF NOT EXISTS video_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE video_waitlist ENABLE ROW LEVEL SECURITY;

-- Inserts happen server-side via the service-role client (bypasses RLS),
-- so no anon/authenticated policies are needed — this table is
-- admin/service-role read-and-write only.
