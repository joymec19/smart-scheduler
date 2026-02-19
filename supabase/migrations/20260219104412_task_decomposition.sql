-- ============================================================================
-- 002_task_decomposition.sql — Task Decomposition Feature
-- ============================================================================

-- ---------- ENSURE ALL ENUM VALUES EXIST (remote may have been seeded manually) ----------

ALTER TYPE task_category ADD VALUE IF NOT EXISTS 'learning';
ALTER TYPE task_category ADD VALUE IF NOT EXISTS 'work';
ALTER TYPE task_category ADD VALUE IF NOT EXISTS 'health';
ALTER TYPE task_category ADD VALUE IF NOT EXISTS 'personal';
ALTER TYPE task_category ADD VALUE IF NOT EXISTS 'info';
ALTER TYPE task_category ADD VALUE IF NOT EXISTS 'creative';

-- ---------- ENSURE set_updated_at EXISTS (may be missing from partial 001 apply) ----------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------- EXTEND TASKS FOR SUBTASK SUPPORT ----------

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS parent_task_id   uuid REFERENCES tasks (id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_decomposed    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS subtask_order    integer NOT NULL DEFAULT 0;

CREATE INDEX idx_tasks_parent ON tasks (parent_task_id) WHERE parent_task_id IS NOT NULL;

-- ---------- DECOMPOSITION TEMPLATES ----------

CREATE TABLE decomposition_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles (id) ON DELETE CASCADE,  -- NULL = global template
  category    text,  -- text avoids same-transaction enum issues
  name        text NOT NULL,
  description text,
  steps       jsonb NOT NULL DEFAULT '[]',
  -- steps shape: [{"title": "...", "estimated_minutes": 30, "order": 1}, ...]
  is_global   boolean NOT NULL DEFAULT false,
  use_count   integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_templates_user     ON decomposition_templates (user_id);
CREATE INDEX idx_templates_category ON decomposition_templates (category);
CREATE INDEX idx_templates_global   ON decomposition_templates (is_global) WHERE is_global = true;

CREATE TRIGGER set_templates_updated_at
  BEFORE UPDATE ON decomposition_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- ROW LEVEL SECURITY ----------

ALTER TABLE decomposition_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can read global templates; users can read their own
CREATE POLICY templates_select ON decomposition_templates FOR SELECT
  USING (is_global = true OR auth.uid() = user_id);

-- Users can only insert their own non-global templates
CREATE POLICY templates_insert ON decomposition_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_global = false);

CREATE POLICY templates_update ON decomposition_templates FOR UPDATE
  USING (auth.uid() = user_id AND is_global = false);

CREATE POLICY templates_delete ON decomposition_templates FOR DELETE
  USING (auth.uid() = user_id AND is_global = false);

-- ---------- SEED GLOBAL TEMPLATES ----------

INSERT INTO decomposition_templates (user_id, category, name, description, steps, is_global) VALUES

  (NULL, 'work', 'Write Blog Post', 'Standard blog post workflow',
   '[
     {"title": "Research topic",      "estimated_minutes": 30, "order": 1},
     {"title": "Create outline",      "estimated_minutes": 15, "order": 2},
     {"title": "Write first draft",   "estimated_minutes": 60, "order": 3},
     {"title": "Edit and revise",     "estimated_minutes": 30, "order": 4},
     {"title": "Publish and promote", "estimated_minutes": 15, "order": 5}
   ]'::jsonb, true),

  (NULL, 'learning', 'Learn New Skill', 'Structured learning approach',
   '[
     {"title": "Find resources",      "estimated_minutes": 20, "order": 1},
     {"title": "Study core concepts", "estimated_minutes": 60, "order": 2},
     {"title": "Practice exercises",  "estimated_minutes": 45, "order": 3},
     {"title": "Build a project",     "estimated_minutes": 90, "order": 4},
     {"title": "Review and summarize","estimated_minutes": 20, "order": 5}
   ]'::jsonb, true),

  (NULL, 'health', 'Workout Session', 'Complete workout routine',
   '[
     {"title": "Warm up",             "estimated_minutes": 10, "order": 1},
     {"title": "Main workout",        "estimated_minutes": 40, "order": 2},
     {"title": "Cool down / stretch", "estimated_minutes": 10, "order": 3}
   ]'::jsonb, true),

  (NULL, 'creative', 'Create Video Content', 'End-to-end video production',
   '[
     {"title": "Plan and script",          "estimated_minutes": 30, "order": 1},
     {"title": "Record footage",           "estimated_minutes": 60, "order": 2},
     {"title": "Edit video",               "estimated_minutes": 90, "order": 3},
     {"title": "Add captions + thumbnail", "estimated_minutes": 20, "order": 4},
     {"title": "Upload and schedule",      "estimated_minutes": 10, "order": 5}
   ]'::jsonb, true);
