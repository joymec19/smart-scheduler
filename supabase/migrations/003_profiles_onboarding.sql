-- ============================================================================
-- 003_profiles_onboarding.sql
-- Add has_onboarded, display_name, persona_type to profiles table.
-- Backfill all pre-existing users as onboarded (they pre-date this feature).
-- ============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS has_onboarded boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_name   text,
  ADD COLUMN IF NOT EXISTS persona_type   text;

-- All profiles that existed before this migration are considered already onboarded
UPDATE profiles SET has_onboarded = true WHERE has_onboarded = false;
