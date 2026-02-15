-- ============================================================================
-- seed.sql — Sample data for Smart Scheduler MVP
-- ============================================================================
-- Run AFTER creating a test user via Supabase Auth.
-- Replace the UUID below with your test user's auth.users id.

DO $$
DECLARE
  test_user_id uuid;
  task1 uuid := gen_random_uuid();
  task2 uuid := gen_random_uuid();
  task3 uuid := gen_random_uuid();
  task4 uuid := gen_random_uuid();
  task5 uuid := gen_random_uuid();
BEGIN
  -- Grab the first profile (created automatically by the signup trigger)
  SELECT id INTO test_user_id FROM profiles LIMIT 1;

  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'No profile found. Sign up a test user first.';
  END IF;

  -- ---- 5 SAMPLE TASKS ----

  INSERT INTO tasks (id, user_id, title, description, category, priority, status, due_at, estimated_minutes, original_due_at)
  VALUES
    (task1, test_user_id,
     'Record YouTube tutorial on React hooks',
     'Cover useState, useEffect, and custom hooks with live coding examples.',
     'creative', 'high', 'pending',
     now() + interval '1 day', 90, now() + interval '1 day'),

    (task2, test_user_id,
     'Review analytics dashboard wireframes',
     'Go through Figma designs and leave comments for the team.',
     'work', 'medium', 'pending',
     now() + interval '2 days', 30, now() + interval '2 days'),

    (task3, test_user_id,
     'Morning run — 5K',
     NULL,
     'health', 'medium', 'completed',
     now() - interval '1 day', 35, now() - interval '1 day'),

    (task4, test_user_id,
     'Read chapter 5 of "Atomic Habits"',
     'Focus on habit stacking and implementation intentions.',
     'learning', 'low', 'missed',
     now() - interval '2 days', 25, now() - interval '2 days'),

    (task5, test_user_id,
     'Draft newsletter intro',
     'Write the opening section for this week''s creator newsletter.',
     'creative', 'high', 'pending',
     now() + interval '3 hours', 45, now() + interval '3 hours');

  -- Mark task3 as completed
  UPDATE tasks SET completed_at = now() - interval '1 day', actual_minutes = 32
  WHERE id = task3;

  -- ---- 3 MENTAL NOTES ----

  INSERT INTO mental_notes (user_id, category, content, tags, source_task_id)
  VALUES
    (test_user_id, 'creative',
     'Try using a split-screen format for the hooks tutorial — viewers liked it last time.',
     ARRAY['youtube', 'format', 'idea'], task1),

    (test_user_id, 'learning',
     'Look into spaced-repetition apps to remember what I read.',
     ARRAY['reading', 'retention', 'tools'], NULL),

    (test_user_id, 'work',
     'Ask designer about adding a dark-mode toggle to the dashboard.',
     ARRAY['dashboard', 'design', 'dark-mode'], task2);

  -- ---- 2 NUDGES ----

  INSERT INTO nudges (user_id, type, title, message, related_task_id, impact_score, status)
  VALUES
    (test_user_id, 'pattern',
     'Reading tasks tend to slip',
     'You''ve missed 3 reading tasks this month. Try scheduling them right after your morning routine when energy is high.',
     task4, 7.5, 'active'),

    (test_user_id, 'momentum',
     'You''re on a 3-day streak!',
     'Great momentum — completing today''s creative tasks will keep it going.',
     task5, 6.0, 'active');

  -- ---- ACTIVITY LOG ENTRIES ----

  INSERT INTO task_activity_logs (user_id, task_id, event_type, payload)
  VALUES
    (test_user_id, task3, 'completed', '{"actual_minutes": 32}'::jsonb),
    (test_user_id, task4, 'missed',    '{"reason": "auto_expired"}'::jsonb);

END $$;
