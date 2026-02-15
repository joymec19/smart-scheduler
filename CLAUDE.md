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
| State | Zustand (separate stores: tasks, notes, nudges, analytics) |
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
id                  uuid PRIMARY KEY
user_id             uuid REFERENCES profiles(id)
title               text NOT NULL
description         text
category            enum (learning, work, health, personal, info, creative)
priority            enum (high, medium, low)
status              enum (pending, completed, missed)
due_at              timestamptz
estimated_minutes   integer
actual_minutes      integer NULL
completed_at        timestamptz NULL
reschedule_count    integer DEFAULT 0
created_at          timestamptz DEFAULT now()

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

1. **Onboarding**: Signup → Dashboard shows metrics → Add Task (all fields) → Swipe complete/miss
2. **Rescheduling**: Miss task → Reschedule modal → Accept suggestion → See in analytics
3. **Nudge Interaction**: Dashboard nudge → Tap act → Navigate to relevant view
4. **Quick Note**: FAB Quick Note → Capture with category → See in Notes list
5. **Analytics Review**: Analytics → See completion % + 2-3 coaching insights

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
├── components/           # Reusable UI components
├── pages/                # Route pages (Dashboard, Tasks, Notes, Analytics)
├── stores/               # Zustand stores (tasks, notes, nudges, analytics)
├── lib/                  # Supabase client, utilities
└── hooks/                # Custom React hooks
```
