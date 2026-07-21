-- Adds the enriched analysis fields used by app/api/analyze/route.ts
ALTER TABLE ai_analyses
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS best_platforms text[],
  ADD COLUMN IF NOT EXISTS seasonality text,
  ADD COLUMN IF NOT EXISTS wow_factor text;
