-- ============================================================================
-- 001_initial_schema.sql — Smart Scheduler MVP
-- ============================================================================

-- ---------- ENUMS ----------

CREATE TYPE task_category AS ENUM (
  'learning', 'work', 'health', 'personal', 'info', 'creative'
);

CREATE TYPE task_priority AS ENUM ('high', 'medium', 'low');

CREATE TYPE task_status AS ENUM ('pending', 'completed', 'missed', 'rescheduled');

CREATE TYPE nudge_type AS ENUM ('pattern', 'momentum', 'content_capture');

CREATE TYPE nudge_status AS ENUM ('active', 'acted', 'dismissed', 'expired');

-- ---------- PROFILES ----------

CREATE TABLE profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name       text,
  timezone   text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------- TASKS ----------

CREATE TABLE tasks (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  title                   text NOT NULL,
  description             text,
  category                task_category NOT NULL,
  priority                task_priority NOT NULL DEFAULT 'medium',
  status                  task_status NOT NULL DEFAULT 'pending',
  due_at                  timestamptz,
  estimated_minutes       integer,
  actual_minutes          integer,
  completed_at            timestamptz,
  original_due_at         timestamptz,
  rescheduled_from_task_id uuid REFERENCES tasks (id) ON DELETE SET NULL,
  reschedule_count        integer NOT NULL DEFAULT 0,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

CREATE INDEX idx_tasks_user_status ON tasks (user_id, status);
CREATE INDEX idx_tasks_user_due    ON tasks (user_id, due_at);

-- ---------- MENTAL NOTES ----------

CREATE TABLE mental_notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  category        task_category NOT NULL,
  content         text NOT NULL,
  tags            text[] DEFAULT '{}',
  source_task_id  uuid REFERENCES tasks (id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_notes_user_created ON mental_notes (user_id, created_at DESC);

-- ---------- NUDGES ----------

CREATE TABLE nudges (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  type            nudge_type NOT NULL,
  title           text NOT NULL,
  message         text NOT NULL,
  related_task_id uuid REFERENCES tasks (id) ON DELETE SET NULL,
  impact_score    numeric DEFAULT 0,
  status          nudge_status NOT NULL DEFAULT 'active',
  triggered_at    timestamptz DEFAULT now(),
  acted_at        timestamptz,
  dismissed_at    timestamptz
);

CREATE INDEX idx_nudges_user_status ON nudges (user_id, status);

-- ---------- TASK ACTIVITY LOGS ----------

CREATE TABLE task_activity_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  task_id     uuid NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
  event_type  text NOT NULL,
  payload     jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_logs_user_created ON task_activity_logs (user_id, created_at DESC);

-- ---------- UPDATED_AT TRIGGER ----------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_notes_updated_at
  BEFORE UPDATE ON mental_notes FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- ROW LEVEL SECURITY ----------

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_notes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE nudges             ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users own their row
CREATE POLICY profiles_select ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (auth.uid() = id);

-- Tasks
CREATE POLICY tasks_select ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY tasks_insert ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY tasks_update ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY tasks_delete ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Mental notes
CREATE POLICY notes_select ON mental_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notes_insert ON mental_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY notes_update ON mental_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY notes_delete ON mental_notes FOR DELETE USING (auth.uid() = user_id);

-- Nudges
CREATE POLICY nudges_select ON nudges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY nudges_insert ON nudges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY nudges_update ON nudges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY nudges_delete ON nudges FOR DELETE USING (auth.uid() = user_id);

-- Activity logs
CREATE POLICY logs_select ON task_activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY logs_insert ON task_activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
