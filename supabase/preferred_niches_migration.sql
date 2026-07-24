-- Stores the niches a user picked during onboarding, used to
-- personalize the dashboard (filter bar ordering, "Recommended for you").
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_niches text[] NOT NULL DEFAULT '{}'::text[];
