-- ============================================================================
-- 002_task_decomposition.sql — Task Decomposition Feature
-- ============================================================================

-- ---------- 1. ALTER tasks ----------

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS parent_task_id       uuid REFERENCES tasks (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_subtask           boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS subtask_order        integer,
  ADD COLUMN IF NOT EXISTS is_blocking          boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS decomposition_source text;

-- Remove column added by the earlier timestamped draft migration if it exists
ALTER TABLE tasks DROP COLUMN IF EXISTS is_decomposed;

CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id
  ON tasks (parent_task_id) WHERE parent_task_id IS NOT NULL;

-- ---------- 2. decomposition_templates ----------
-- Drop the draft table from the earlier timestamped migration (schema changed).

DROP TABLE IF EXISTS decomposition_templates CASCADE;

CREATE TABLE decomposition_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category    text NOT NULL,
  sub_type    text,
  priority    text NOT NULL DEFAULT 'medium',
  steps       jsonb NOT NULL DEFAULT '[]',
  -- steps shape: [{"order": 1, "title": "...", "estimated_minutes": 30, "is_blocking": false}]
  is_system   boolean NOT NULL DEFAULT true,
  user_id     uuid REFERENCES profiles (id) ON DELETE CASCADE,  -- null = system template
  usage_count integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_decomp_templates_cat_pri
  ON decomposition_templates (category, priority);

CREATE TRIGGER set_decomp_templates_updated_at
  BEFORE UPDATE ON decomposition_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE decomposition_templates ENABLE ROW LEVEL SECURITY;

-- System templates are readable by every authenticated user
CREATE POLICY decomp_templates_select ON decomposition_templates FOR SELECT
  USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY decomp_templates_insert ON decomposition_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = false);

CREATE POLICY decomp_templates_update ON decomposition_templates FOR UPDATE
  USING (auth.uid() = user_id AND is_system = false);

CREATE POLICY decomp_templates_delete ON decomposition_templates FOR DELETE
  USING (auth.uid() = user_id AND is_system = false);

-- ---------- 3. decomposition_logs ----------

CREATE TABLE decomposition_logs (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  parent_task_id             uuid NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
  template_id                uuid REFERENCES decomposition_templates (id) ON DELETE SET NULL,
  original_estimated_minutes integer,
  subtasks_generated         integer,
  user_edits                 jsonb DEFAULT '[]',
  -- user_edits shape: [{"action": "deleted"|"renamed"|"merged"|"reordered", ...}]
  clarifying_answers         jsonb DEFAULT '{}',
  created_at                 timestamptz DEFAULT now()
);

CREATE INDEX idx_decomp_logs_user_created
  ON decomposition_logs (user_id, created_at DESC);

ALTER TABLE decomposition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY decomp_logs_select ON decomposition_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY decomp_logs_insert ON decomposition_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ---------- 4. user_decomposition_preferences ----------

CREATE TABLE user_decomposition_preferences (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL UNIQUE REFERENCES profiles (id) ON DELETE CASCADE,
  preferred_chunk_minutes integer NOT NULL DEFAULT 25,
  granularity_preference  text    NOT NULL DEFAULT 'balanced',
  -- granularity_preference: 'fewer_steps' | 'balanced' | 'more_detail'
  updated_at              timestamptz DEFAULT now()
);

CREATE TRIGGER set_decomp_prefs_updated_at
  BEFORE UPDATE ON user_decomposition_preferences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE user_decomposition_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY decomp_prefs_select ON user_decomposition_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY decomp_prefs_insert ON user_decomposition_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY decomp_prefs_update ON user_decomposition_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ---------- 5. SEED SYSTEM TEMPLATES ----------

INSERT INTO decomposition_templates (category, sub_type, priority, steps, is_system, user_id) VALUES

  -- LEARNING: default
  ('learning', NULL, 'medium',
   '[
     {"order": 1, "title": "Skim overview",             "estimated_minutes": 15, "is_blocking": true},
     {"order": 2, "title": "Deep read/watch",           "estimated_minutes": 30, "is_blocking": true},
     {"order": 3, "title": "Take structured notes",     "estimated_minutes": 20, "is_blocking": false},
     {"order": 4, "title": "Create flashcards/summary", "estimated_minutes": 15, "is_blocking": false},
     {"order": 5, "title": "Do 3 practice problems",    "estimated_minutes": 20, "is_blocking": false}
   ]'::jsonb, true, NULL),

  -- LEARNING: long_form_article
  ('learning', 'long_form_article', 'high',
   '[
     {"order": 1, "title": "Clarify outcome",              "estimated_minutes": 20, "is_blocking": true},
     {"order": 2, "title": "Discover & select references", "estimated_minutes": 60, "is_blocking": true},
     {"order": 3, "title": "Capture structured notes",     "estimated_minutes": 45, "is_blocking": true},
     {"order": 4, "title": "Draft outline & skeleton",     "estimated_minutes": 45, "is_blocking": true},
     {"order": 5, "title": "Write first draft",            "estimated_minutes": 90, "is_blocking": true},
     {"order": 6, "title": "Edit for clarity & format",   "estimated_minutes": 60, "is_blocking": false},
     {"order": 7, "title": "Final polish & schedule",     "estimated_minutes": 30, "is_blocking": false}
   ]'::jsonb, true, NULL),

  -- WORK: default
  ('work', NULL, 'medium',
   '[
     {"order": 1, "title": "Clarify requirements",    "estimated_minutes": 20, "is_blocking": true},
     {"order": 2, "title": "Draft outline",           "estimated_minutes": 25, "is_blocking": true},
     {"order": 3, "title": "Create v1",               "estimated_minutes": 45, "is_blocking": true},
     {"order": 4, "title": "Review with stakeholder", "estimated_minutes": 20, "is_blocking": false},
     {"order": 5, "title": "Finalize and send",       "estimated_minutes": 15, "is_blocking": false}
   ]'::jsonb, true, NULL),

  -- HEALTH: default
  ('health', NULL, 'medium',
   '[
     {"order": 1, "title": "Plan workout/meal",        "estimated_minutes": 10, "is_blocking": true},
     {"order": 2, "title": "Do session",               "estimated_minutes": 30, "is_blocking": true},
     {"order": 3, "title": "Log results/energy level", "estimated_minutes":  5, "is_blocking": false}
   ]'::jsonb, true, NULL),

  -- PERSONAL: default
  ('personal', NULL, 'medium',
   '[
     {"order": 1, "title": "Decide",    "estimated_minutes": 10, "is_blocking": true},
     {"order": 2, "title": "Prepare",   "estimated_minutes": 15, "is_blocking": true},
     {"order": 3, "title": "Do",        "estimated_minutes": 30, "is_blocking": true},
     {"order": 4, "title": "Follow-up", "estimated_minutes": 10, "is_blocking": false}
   ]'::jsonb, true, NULL),

  -- INFO: default
  ('info', NULL, 'medium',
   '[
     {"order": 1, "title": "Collect sources",       "estimated_minutes": 15, "is_blocking": true},
     {"order": 2, "title": "Skim & filter",         "estimated_minutes": 20, "is_blocking": true},
     {"order": 3, "title": "Deep read 2-3 best",    "estimated_minutes": 30, "is_blocking": true},
     {"order": 4, "title": "Synthesize into notes", "estimated_minutes": 20, "is_blocking": false}
   ]'::jsonb, true, NULL),

  -- CREATIVE: default
  ('creative', NULL, 'medium',
   '[
     {"order": 1, "title": "Warm-up",         "estimated_minutes": 10, "is_blocking": false},
     {"order": 2, "title": "Idea generation", "estimated_minutes": 20, "is_blocking": true},
     {"order": 3, "title": "Selection",       "estimated_minutes": 10, "is_blocking": true},
     {"order": 4, "title": "Execution",       "estimated_minutes": 40, "is_blocking": true},
     {"order": 5, "title": "Polish",          "estimated_minutes": 20, "is_blocking": false}
   ]'::jsonb, true, NULL);
