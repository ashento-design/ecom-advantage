-- Lightweight first-party event log, independent of Vercel Analytics (which
-- isn't queryable from within the app on our plan). Backs the "page views
-- this week" and "conversion rate" numbers on /admin/analytics. Most
-- analyzed products and ad style/format popularity are derived from
-- existing tables (ai_analyses, generated_ads) rather than duplicated here.

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('page_view', 'product_analyzed', 'ad_generated', 'store_analyzed', 'upgrade_clicked')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON analytics_events (event_type, created_at);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
-- page_view events come through /api/analytics/track using the
-- service-role client (not a direct client-side insert), and every other
-- event type is written server-side from its own API route — so no
-- anon/authenticated policies are granted here.
