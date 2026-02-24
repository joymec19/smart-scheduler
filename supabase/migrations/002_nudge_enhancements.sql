-- ============================================================================
-- 002_nudge_enhancements.sql — Daily nudge system + bundling rules
-- ============================================================================

-- Extend nudge_type enum with bundling rule types
ALTER TYPE nudge_type ADD VALUE IF NOT EXISTS 'podcast_bundling';
ALTER TYPE nudge_type ADD VALUE IF NOT EXISTS 'learning_content';
ALTER TYPE nudge_type ADD VALUE IF NOT EXISTS 'work_reflection';

-- Ensure original rule types exist (remote schema may have diverged)
ALTER TYPE nudge_type ADD VALUE IF NOT EXISTS 'pattern';
ALTER TYPE nudge_type ADD VALUE IF NOT EXISTS 'momentum';
ALTER TYPE nudge_type ADD VALUE IF NOT EXISTS 'content_capture';

-- Track last nudge generation per user (used by Edge Function cron)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_nudge_generation timestamptz;

-- Index for efficient cron queries: users who need fresh nudges
CREATE INDEX IF NOT EXISTS idx_profiles_nudge_gen
  ON profiles (last_nudge_generation ASC NULLS FIRST);
