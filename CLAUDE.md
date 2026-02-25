# Smart Scheduler MVP - CLAUDE.md

**IMPORTANT**: All prompts must reference this file first. NEVER regenerate existing working code. Focus on one feature per session.

---

## 1. PROJECT OVERVIEW

**Objective**: Build intelligent task manager for content creators/busy professionals that auto-reschedules missed tasks, generates smart nudges, captures mental notes, and shows coaching analytics.

**North Star**: 25% task completion uplift
**Target**: 50k users Year 1

### MVP Scope (Phase 1 P1 Only)

1. **Task CRUD** - title, description, 6 categories, 3 priorities, due date, estimated time
2. **Intelligent Rescheduling** - rule-based algorithm for missed tasks
3. **Smart Nudges** - 3 types: pattern, momentum, content capture
4. **Mental Note Capture** - 6 categories, tags, task linking
5. **Dashboard** - today's metrics + top tasks + nudges
6. **Analytics** - completion %, missed by category, coaching insights
7. **Mobile-First Gradient UI** - React + Tailwind + Framer Motion

### Explicitly Out of Scope

- Team collaboration
- Calendar sync
- Push notifications
- ML (heuristics only)
- Recurring tasks

---

## 2. TECH STACK

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion + React Router v6 |
| State | Zustand (separate stores: tasks, notes, nudges, analytics, decomposition) |
| Backend/DB | Supabase (Postgres + Auth) |
| Hosting | Vercel (frontend) + Supabase (backend) |
| Analytics | Mixpanel (event tracking only) |

### NOT Using

- Next.js
- Firebase / Firebase Auth
- Redux
- TypeScript (JS only for speed)

---

## 3. SUPABASE SCHEMA

```sql
-- profiles
id          uuid PRIMARY KEY
name        text
timezone    text

-- tasks
id                   uuid PRIMARY KEY
user_id              uuid REFERENCES profiles(id)
title                text NOT NULL
description          text
category             enum (learning, work, health, personal, info, creative)
priority             enum (high, medium, low)
status               enum (pending, completed, missed)
due_at               timestamptz
estimated_minutes    integer
actual_minutes       integer NULL
completed_at         timestamptz NULL
reschedule_count     integer DEFAULT 0
created_at           timestamptz DEFAULT now()
-- subtask fields (added Phase 4)
parent_task_id       uuid REFERENCES tasks(id) NULL
is_subtask           boolean DEFAULT false
subtask_order        integer NULL
is_blocking          boolean DEFAULT false
decomposition_source text NULL

-- decomposition_templates (Phase 4)
id          uuid PRIMARY KEY
category    text
name        text
steps       jsonb
is_system   boolean DEFAULT true

-- decomposition_logs (Phase 4)
id              uuid PRIMARY KEY
user_id         uuid REFERENCES profiles(id)
parent_task_id  uuid REFERENCES tasks(id)
template_id     uuid REFERENCES decomposition_templates(id) NULL
granularity     text
clarifying_q    text
clarifying_a    text
edits_json      jsonb
created_at      timestamptz DEFAULT now()

-- user_decomposition_preferences (Phase 4)
id               uuid PRIMARY KEY
user_id          uuid REFERENCES profiles(id)
chunk_size_pref  text
granularity_pref text

-- mental_notes
id              uuid PRIMARY KEY
user_id         uuid REFERENCES profiles(id)
category        enum (learning, work, health, personal, info, creative)
content         text NOT NULL
tags            text[]
source_task_id  uuid REFERENCES tasks(id) NULL

-- nudges
id              uuid PRIMARY KEY
user_id         uuid REFERENCES profiles(id)
type            enum (pattern, momentum, content_capture)
title           text
message         text
impact_score    numeric
status          enum (pending, acted, dismissed)
triggered_at    timestamptz DEFAULT now()

-- task_activity_logs
id          uuid PRIMARY KEY
user_id     uuid REFERENCES profiles(id)
task_id     uuid REFERENCES tasks(id)
event_type  text
payload     jsonb
```

**RLS**: Users own their rows only.

---

## 4. ENVIRONMENT VARIABLES

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_MIXPANEL_TOKEN=your-mixpanel-project-token
VERCEL_PROJECT_NAME=smart-scheduler
```

---

## 5. KEY USER FLOWS

Test these end-to-end:

1. **Onboarding**: Signup → Dashboard shows metrics → Add Task (all fields) → Tap ✓ Complete or ⟳ Reschedule button on task card
2. **Rescheduling**: Miss task → Reschedule modal → Accept suggestion → See in analytics
3. **Nudge Interaction**: Dashboard nudge → Tap act → Navigate to relevant view
4. **Quick Note**: FAB Quick Note → Capture with category → See in Notes list
5. **Analytics Review**: Analytics → See completion % + 2-3 coaching insights
6. **Task Decomposition**: Tap "✂️ Break into subtasks" on task card (or "break it down" in Reschedule Modal after 3+ reschedules) → Answer clarifying question → Pick granularity (Fewer/Balanced/More Detail) → Edit/reorder proposed steps → Create subtasks → Mark individual steps complete from task card accordion

---

## 6. DESIGN SYSTEM

### Colors (Tailwind Classes)

| Element | Class |
|---------|-------|
| Primary Gradient | `bg-gradient-to-r from-purple-500 to-violet-600` |
| Success | `text-green-500` / `bg-green-500` |
| Warning | `text-amber-500` / `bg-amber-500` |
| Error | `text-red-500` / `bg-red-500` |

### Category Colors

| Category | Color |
|----------|-------|
| Learning | `blue-500` |
| Work | `purple-500` |
| Health | `green-500` |
| Personal | `pink-500` |
| Info | `amber-500` |
| Creative | `cyan-500` |

### Component Patterns

```jsx
// Cards
className="rounded-xl shadow-sm hover:shadow-md transition-all"

// Mobile-first layout
className="min-h-screen flex flex-col gap-4"

// Gradient button
className="bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl px-4 py-2"
```

---

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## Project Structure

```
src/
├── main.jsx              # App entry point
├── App.jsx               # Root component + routing
├── index.css             # Global styles + Tailwind
├── components/
│   ├── tasks/            # TaskCard (Complete/Reschedule buttons + SubtaskActionRow), TaskList, RescheduleModal
│   ├── decomposition/    # DecomposeWizard (3-step), SubtaskTimeline
│   └── ...               # nudges, notes, Skeleton, etc.
├── pages/                # Dashboard, Tasks, Notes, Analytics
├── stores/               # useTaskStore, useNudgeStore, useNotesStore, useAnalyticsStore, useDecompositionStore
├── lib/                  # supabase, decomposition-engine, decomposition-templates, decomposition-suggestions, analytics, analytics-tracking
└── hooks/                # useAuth, etc.
```

---

## 7. TASK DECOMPOSITION FEATURE (Phase 4)

### What it does
A task can be decomposed into subtasks in two ways:
- **From TaskCard**: "✂️ Break into subtasks" button — visible on any pending task with no existing subtasks and `reschedule_count < 3`
- **From RescheduleModal**: "Want me to break it down?" — appears when `reschedule_count >= 3`

Both open a 3-step wizard:
1. **Clarifying question** — category-specific prompt asking what "done" looks like
2. **Granularity picker** — user chooses from 3 cards: Fewer Steps ⚡ / Balanced ⚖️ / More Detail 🔬 (each has icon + description); tapping a card immediately generates and navigates to Step 3
3. **Proposed breakdown** — editable subtask list (rename inline, reorder ▲▼, adjust time, add/delete); chosen granularity shown as a locked badge; "✓ Looks good, create subtasks" saves and transitions to an in-place success screen (no step 4 — `confirmed: true` within step 3)

### TaskCard interaction model
- Swipe gestures **removed** — replaced with **✓ Complete** (green) and **⟳ Reschedule** (amber) tap buttons at the bottom of every pending task card
- Subtask accordion: progress bar + "X/N steps done"; expanded view uses `SubtaskActionRow` — circle checkbox to complete a step, tappable time label for inline minute editing

### Key files
| File | Purpose |
|------|---------|
| src/lib/decomposition-templates.js | Category templates + clarifying questions |
| src/lib/decomposition-engine.js | generateSubtasks, adjustForUserPatterns, saveSubtasks, learnFromEdits |
| src/lib/decomposition-suggestions.js | Pattern recognition + dependency chains (getPatternSuggestion) |
| src/components/decomposition/DecomposeWizard.jsx | 3-step wizard UI |
| src/components/decomposition/SubtaskTimeline.jsx | Reusable vertical timeline (used in wizard confirmed screen) |
| src/components/tasks/TaskCard.jsx | SubtaskActionRow, Complete/Reschedule buttons, subtask accordion |
| src/stores/useDecompositionStore.js | Wizard state machine |
| src/stores/useTaskStore.js | Added: fetchSubtasks, decomposeTask, updateSubtaskOrder, deleteSubtask, getParentProgress |

### Wizard store state shape
```js
wizardStep: 1 | 2 | 3          // step 2 = granularity picker, step 3 = subtask editor
confirmed: boolean              // step 3 has two sub-states: edit (false) → success (true)
granularity: 'fewer_steps' | 'balanced' | 'more_detail'
generatedSubtasks: []
clarifyingAnswer: string
patternSuggestion: null | { hasSuggestion, suggestionText }
isLoading: boolean
```
Key actions: `startWizard(task)`, `loadSubtasksForGranularity(task, answer, granularity)`, `setGranularity(level)` (back-compat alias), `confirmDecomposition(parentTaskId)`, `resetWizard()`

### Category breakdown patterns
| Category | Pattern |
|----------|---------|
| Learning | Discover → Consume → Capture → Recall → Apply |
| Work | Clarify → Plan → Produce → Review → Ship |
| Health | Prep → Execute → Reflect |
| Personal | Decide → Prepare → Do → Follow-up |
| Info | Collect → Skim → Deep read → Synthesize |
| Creative | Warm-up → Ideate → Select → Execute → Polish |

### Urgency logic
- **High**: 15–30 min chunks, blocking-aware, fit today
- **Medium**: 20–45 min, checkpoint at midpoint, spread 2–3 days
- **Low**: 15–25 min, quality-focused, suggest batching

### Mixpanel events added
- `task_decompose_started` — `{ category, priority, reschedule_count }`
- `task_decompose_completed` — `{ category, subtasks_count, template_used, granularity }`
- `task_decompose_subtask_edited` — `{ edit_type: 'rename'|'delete'|'add'|'reorder'|'time_change' }`
- `task_decompose_pattern_suggestion_shown` — `{ suggestion_type }`
- `task_decompose_pattern_suggestion_accepted` — `{ suggestion_type }`

---

## 8. NEW FEATURES (Sessions 1–7)

### Packages Added
- `react-big-calendar` — calendar view component
- `rrule` — recurring rule parsing
- `react-web-share` — Web Share API wrapper
- `@dnd-kit/core` + `@dnd-kit/sortable` — drag-and-drop
- `googleapis` — Google Calendar API client

### New Supabase Tables
```sql
-- recurring_rules
id               uuid PRIMARY KEY
user_id          uuid REFERENCES profiles(id)
task_template    jsonb
rrule_string     text
next_occurrence  timestamptz
active           boolean DEFAULT true

-- google_calendar_tokens
id             uuid PRIMARY KEY
user_id        uuid REFERENCES profiles(id)
access_token   text
refresh_token  text
expiry         timestamptz

-- task_shares
id           uuid PRIMARY KEY
user_id      uuid REFERENCES profiles(id)
task_id      uuid REFERENCES tasks(id) NULL
note_id      uuid REFERENCES mental_notes(id) NULL
share_method text
shared_at    timestamptz DEFAULT now()
```

### profiles table addition
- `has_onboarded` boolean DEFAULT false

### New Routes
| Route | Component |
|-------|-----------|
| `/calendar` | CalendarPage |
| `/onboarding` | OnboardingPage |

### Onboarding
- Shown once on first login when `profiles.has_onboarded = false`
- Sets `has_onboarded = true` on completion/skip

### Calendar (`/calendar`)
- `react-big-calendar` with DnD (`@dnd-kit`)
- Drag tasks to reschedule — updates `due_at` in Supabase
- Syncs to Google Calendar via OAuth tokens stored in `google_calendar_tokens`

### Recurring Tasks
- Powered by `rrule.js`
- 4 patterns: daily / alternate days / 3x per week / specific day of week
- Rules stored in `recurring_rules`; `next_occurrence` updated after each spawn

### Share
- Web Share API via `react-web-share`
- Fallbacks: Gmail, WhatsApp, native apps
- Share events logged to `task_shares`
