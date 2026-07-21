-- Adds onboarding tracking used by the welcome modal on first dashboard visit
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
