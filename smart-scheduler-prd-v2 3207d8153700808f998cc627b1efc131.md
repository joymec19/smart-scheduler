# smart-scheduler-prd-v2

# Smart Scheduler - Product Requirements Document (PRD)

**Version**: 2.1

**Last Updated**: February 24, 2026

**Owner**: Product Manager

**Status**: In Development - MVP Deployed to Production

## 🚀 Implementation Status

**Live URL**: [https://smart-scheduler-mu.vercel.app/](https://smart-scheduler-mu.vercel.app/)

**Deployment Status**: ✅ Production (Vercel)

**Database**: ✅ Supabase PostgreSQL

**Authentication**: ✅ Supabase Auth

### Completed Features (As of Feb 24, 2026)

- ✅ **Dashboard**: Fully functional with daily overview, metrics cards, and top priority tasks
- ✅ **User Authentication**: Sign up/Sign in with Supabase Auth
- ✅ **Task Management**: Complete CRUD with Tasks page
- ✅ **Mental Notes**: Notes page with capture functionality
- ✅ **Analytics**: Analytics dashboard with metrics
- ✅ **Profile Management**: User profile page
- ✅ **Responsive UI**: Mobile-first design with bottom navigation
- ✅ **Real-time Metrics**: Dashboard shows Today's Tasks, Completed, Missed, and Active Nudges counts
- ✅ **Smart Nudges Display**: Nudge cards on dashboard ("All caught up" state implemented)

### In Progress / Next Sprint

- 🔄 **Rescheduling Logic**: Backend edge functions for suggestion generation
- 🔄 **Nudge Generation Engine**: Pattern and momentum nudge triggers
- 🔄 **Task Status Automation**: Auto-detection of missed tasks
- 🔄 **Analytics Deep Dive**: Drill-down capabilities from metrics

---

---

## 1. Objective

### Potential Business Goals

- **User Acquisition**: Achieve 15,000 registered users within 6 months of MVP launch (stretch goal: 25,000)
- **Geographic Focus**: Primary market is English-speaking professionals in India (Tier-1 cities: Bangalore, Mumbai, Delhi NCR, Hyderabad) + secondary beachhead in 1-2 Western metros (San Francisco, London)
- **Engagement**: Reach 5,000 Monthly Active Users (MAU) by Month 6, with a 25% DAU/MAU ratio
- **Retention**: Achieve 40% Day-7 retention and 25% Day-30 retention by Month 6 (stretch: D7 50%, D30 35%)
- **Revenue Foundation**: Validate premium conversion path with 300+ users on premium waitlist or expressing willingness-to-pay by Month 6

### Expected Product Goals

- **Task Completion Uplift**: Increase user task completion rate by 20% compared to self-reported baseline (from ~50% industry average to 60%)
- **Missed Task Reduction**: Reduce missed tasks by 25% through intelligent rescheduling (from ~30% missed to ~22%)
- **Nudge Engagement**: Achieve 30% engagement rate with nudges (users acting on or thoughtfully dismissing)
- **Mental Note Capture**: Activated users create an average of 3+ mental notes per week within 3 months

### Success Definition

Smart Scheduler succeeds when content creators and busy professionals in our target markets report feeling measurably less overwhelmed (NPS >40 for activated users who completed onboarding + created 5+ tasks), demonstrate productivity improvements (task completion uplift), and actively use the app as their primary productivity and idea capture system.

---

## 2. Problem Statement

### Customer Pain Points

**Primary Pain: Task Overwhelm and Missed Opportunity Cost**
- **Impact**: Knowledge workers and content creators waste an average of 2.5 hours per week managing fragmented task lists across multiple apps, and lose approximately 60% of valuable insights and content ideas that occur during passive consumption (podcasts, reading, meetings)
- **Frequency**: Daily occurrence; the problem compounds as task backlogs grow and insights are forgotten
- **Current workarounds**: Users rely on 3-5 disconnected tools (calendar apps, note apps, to-do lists, voice memos), manual rescheduling of missed tasks, and lose most spontaneous ideas because capture friction is too high

**Secondary Pains**:
1. **No intelligent rescheduling**: When tasks are missed, users manually reschedule without considering patterns, priority, or historical behavior—leading to repeated failures
2. **Reactive not proactive productivity**: Existing tools don’t nudge users toward better behaviors or surface opportunities to improve
3. **Disconnected idea capture**: Insights captured during consumption never flow back into actionable tasks or content pipelines

### Market Opportunity

**TAM (Total Addressable Market)**: $12.8 billion (global productivity and task management software market, 2025)
- Sources: Statista, Grand View Research

**SAM (Serviceable Addressable Market)**: $850 million
- **Geographic focus**: English-speaking professionals in India (Tier-1 cities) + US/UK tech hubs
- **India**: ~15M English-speaking professionals in Tier-1 cities who actively use productivity tools
- **US/UK beachhead**: ~5M professionals in target metros (SF Bay Area, London) matching persona
- Represents: ~20M users × $42 average annual spend

**SOM (Serviceable Obtainable Market)**: $630,000 (Year 1 target)
- Year 1 target: 15,000 users × 3% premium conversion × $12/month × 12 months = ~$630K addressable revenue
- Based on: Small founding team, organic + targeted launch growth, freemium validation

### Root Causes

1. **Fragmented tooling**: Users are forced to context-switch between single-purpose apps, creating cognitive overhead and data silos
2. **Lack of behavioral intelligence**: Existing tools are passive; they don’t learn from user patterns to proactively prevent missed tasks
3. **High capture friction**: The effort required to properly categorize and store a fleeting insight exceeds the perceived value in the moment
4. **No feedback loop**: Users don’t see their productivity patterns visualized, making it impossible to self-correct

### Why Now?

- **AI/LLM awareness**: Users now expect “smart” features; rule-based intelligence feels magical when well-executed
- **Creator economy maturation**: 50M+ people identify as content creators globally; India has 80M+ content creators
- **Remote work normalization**: Distributed work has increased self-management burden
- **Competitive gap**: Existing players (Todoist, Notion, Things) focus on organization, not behavioral intelligence

---

## 3. Solution Overview

### Value Proposition

**Smart Scheduler** is a personal productivity coach for solo professionals who already use Notion or Todoist but feel overwhelmed and idea-rich/time-poor. It helps content creators, busy professionals, and lifelong learners reduce overwhelm and maximize productivity by automatically rescheduling missed tasks, generating smart nudges, and enabling frictionless mental note capture.

Unlike Todoist or Notion, we combine task management with behavioral intelligence—learning from your patterns to prevent failure rather than just recording it.

### How It Solves the Problem

1. **Task Overwhelm** → Rule-based rescheduling suggests optimal new times for missed tasks based on priority, category, and time-of-day patterns → Users experience fewer cascading failures
2. **Lost Insights** → Low-friction mental note capture with one-tap categorization → Ideas are preserved and can flow into content pipelines
3. **Reactive Productivity** → Smart nudges surface proactive behaviors based on simple triggers → Users develop better habits without willpower tax

### Key Differentiators

- **Behavioral Intelligence**: We don’t just store tasks—we use heuristics to intervene before failure occurs
- **Consumption-to-Creation Pipeline**: Mental notes are first-class citizens that connect to content creation
- **Coaching-Style Feedback**: Insights delivered as friendly nudges, not overwhelming dashboards
- **Zero-Learning-Curve Design**: Mobile-first, beautiful UI that feels like a consumer app

### What Smart Scheduler Will NOT Be (MVP Scope Guards)

1. **Not a general notes/wiki platform** — We capture quick insights, not structured documentation (that’s Notion)
2. **Not a calendar replacement** — We manage tasks, not time-blocking or meeting scheduling (that’s Google Calendar)
3. **Not a team workspace** — MVP is for individual productivity only; collaboration is Phase 3+
4. **Not an AI chatbot** — “Intelligence” means heuristics and rules, not conversational AI or ML models

---

## 4. Target Users & Personas

### Primary Persona: Maya - The Content-Creating Professional

**Demographics**:
- Age: 28-38
- Location: Bangalore, Mumbai, Delhi NCR (primary); San Francisco, London (secondary)
- Income: ₹15-30 LPA in India / $80,000-$140,000 in US/UK
- Education: Bachelor’s or higher
- Occupation: Marketing manager, product manager, startup founder, freelance consultant

**Behavioral Segment**: System-Hopper
- Uses 3-5 productivity tools currently: Notion (for notes/wiki), Todoist or Reminders (for tasks), Google Calendar (for meetings), Apple Notes or WhatsApp (for quick capture)
- Has tried and abandoned 2-3 other tools in the past year
- Hasn’t churned from current tools because: “They each do one thing okay, but nothing connects”

**Current Tool Stack & Pain Points**:

| **Tool** | **What It Does** | **Why She Hasn’t Churned** | **What’s Missing** |
| --- | --- | --- | --- |
| Notion | Wiki, docs, databases | Powerful for structured content | Overwhelming for daily tasks; no mobile quick-capture |
| Todoist | Task lists | Simple, reliable | No intelligence; manual rescheduling is tedious |
| Apple Notes | Quick capture | Fast, always available | Notes become graveyard; no connection to tasks |

**Behavioral Profile**:
- Digital savviness: High
- Category spend: $5-15/month on productivity tools combined
- Usage patterns: Checks task lists 5-10x/day; consumes 5+ hours of content weekly (podcasts, newsletters); posts on LinkedIn 1-2x/week but wants to do more
- Pain point intensity: 8/10

**Goals & Motivations**:
- Primary: Regain control of time and feel “on top of things” without burnout
- Secondary: Build professional brand through consistent content creation
- Emotional driver: Reduce anxiety from “open loops” of incomplete tasks and uncaptured ideas

**Willingness to Pay**: ₹499-999/month in India ($9-14/month in US/UK)
- Based on: Currently spends ₹400-800/month combined on tools; would consolidate for integrated solution
- Rationale: <1% of annual income; comparable to existing spend

**Market Size**: 8 million users globally matching this profile in target geographies
- Calculation: India Tier-1 (5M) + US/UK tech hubs (3M) matching demographics and behavior

### Secondary Persona: Arjun - The Learning-Focused Early Career

**Demographics**:
- Age: 22-28
- Location: Tier-1 and Tier-2 cities in India
- Income: ₹4-10 LPA
- Occupation: Junior professional, aspiring entrepreneur, graduate student

**Behavioral Segment**: Default App User
- Uses 1-2 tools: Phone’s default Notes app + WhatsApp for reminders
- Aspires to be more organized but hasn’t invested in tools yet
- Price-sensitive; prefers free tools

**Why Deprioritized for MVP**:
- Lower willingness to pay (free tier only)
- Less acute pain (sees overwhelm as temporary)
- Acquisition cost similar but LTV much lower

**Phase 2 Strategy**: Capture via free tier, convert when income grows or premium features compelling

### Persona Prioritization

- **Phase 1 (MVP)**: Focus exclusively on **Maya (Content-Creating Professional, System-Hopper segment)** because highest pain intensity, proven willingness to pay, and clear use case validates core differentiators
- **MVP UX decisions will be optimized for Maya on mobile**, not for Arjun or desktop-heavy users
- **Phase 2**: Expand to Arjun and desktop optimization once mobile retention validated

---

## 5. User Flows

### Flow 1: Dashboard Overview - Happy Path

**Trigger**: User opens app (morning routine or throughout day)

**Persona: Maya**

**Frequency**: 5-10x daily

**Expected Duration**: 30 seconds - 2 minutes

**Steps**:
1. User opens Smart Scheduler → System displays Dashboard with today’s date, greeting, and quick metrics (tasks today, completed, missed)
2. User scans task preview cards → System shows top 3 priority tasks with visual indicators
3. User notices a missed task indicator → System highlights with amber badge and “Reschedule” CTA
4. User taps on missed task → System navigates to Task Management with rescheduling modal pre-opened

**Success Criteria**: User identifies their most important action within 10 seconds of opening

---

### Flow 2: Task Creation - Happy Path

**Trigger**: User needs to add a new task

**Persona: Maya**

**Frequency**: 3-8 times daily

**Expected Duration**: 30-45 seconds per task

**Steps**:
1. User taps “+” FAB → System opens task creation modal
2. User enters task title (required) → System validates input
3. User selects category from visual picker (Learning, Work, Health, Personal, Information, Creative) → System applies category color
4. User sets priority (High/Medium/Low) → System updates visual indicator
5. User selects due date → System confirms selection
6. User taps “Save” → System creates task, returns to list, shows success toast

**Success Criteria**: Task created in under 30 seconds with title, category, priority, and due date

---

### Flow 3: Intelligent Rescheduling - Core Differentiator

**Trigger**: Task passes due date/time without completion

**Persona**: Maya

**Frequency**: 1-3 times daily

**Expected Duration**: 15-20 seconds

**Steps**:
1. Task deadline passes → System marks task as “missed” with visual indicator
2. User views missed task → System displays rescheduling modal with suggestion
3. System presents: “Suggested: Tomorrow 9:00 AM” with brief rationale
4. User can:
- **Accept** → System reschedules, shows confirmation
- **Adjust** → System opens date/time picker; user modifies and confirms
- **Skip** → System keeps task as missed without rescheduling
5. System logs event for pattern learning

**v1 Rescheduling Logic (Heuristic-Based)**:

```
IF task.priority = HIGH:
  suggest = next_morning_slot (9 AM next available day)
ELSE IF task.category = WORK:
  suggest = next_weekday_morning
ELSE IF task.category = HEALTH:
  suggest = next_early_morning (7 AM)
ELSE:
  suggest = same_time_tomorrow

IF user has 2+ weeks of data:
  adjust based on: most_successful_time_bucket_for_category
```

**Success Criteria**: User completes rescheduling decision in under 15 seconds; 60%+ acceptance rate of suggestions

**Edge Case: Repeated Missed Task (3+ times)**
- System flags with warning: “This task has been rescheduled 3 times. Consider breaking it down?”
- Offers: “Break into smaller tasks” / “Mark as blocked” / “Reschedule anyway”

---

### Flow 4: Smart Nudge Interaction

**Trigger**: Rule-based trigger fires (see logic below)

**Persona: Maya**

**Frequency**: 2-3 nudges per day (strictly rate-limited)

**Expected Duration**: 5-10 seconds

**Steps**:
1. System generates nudge based on trigger rules → Nudge appears on Dashboard
2. User views nudge (e.g., “You’ve completed 3 tasks today! Knock out one more?”)
3. User can:
- **Act**: Tap → System navigates to relevant view
- **Dismiss**: Swipe away → System logs dismissal
4. System tracks engagement for quality measurement

**v1 Nudge Types (MVP - 2 types only)**:

| **Nudge Type** | **Trigger Rule** | **Example** |
| --- | --- | --- |
| Pattern-based | User has missed 3+ tasks in same category this week | “You’ve missed 3 Health tasks this week. Schedule one for tomorrow morning?” |
| Momentum | User completed 2+ tasks today, has pending tasks | “Great momentum! You’ve done 3 tasks. One more before lunch?” |

**Deferred to Phase 2**:
- Content creation nudges (“Capture notes while reading”)
- Multitasking opportunity nudges

**Rate Limiting**: Maximum 3 nudges/day; no nudges within 2 hours of each other

**Success Criteria**: 30%+ of nudges result in action; <20% immediate dismissal (within 2 seconds)

---

### Flow 5: Mental Note Capture - Minimal Friction Path

**Trigger**: User has an insight

**Persona: Maya**

**Frequency**: 3-8 times daily for engaged users

**Expected Duration**: 10-15 seconds

**Steps**:
1. User taps “Quick Note” FAB → System opens rapid capture interface
2. User types note content → System provides character count
3. User taps category chip (Content Ideas / Insights / Quotes / Action Items / Observations / Questions) → System applies category
4. User taps “Save” → System stores note with timestamp, shows animation, returns to previous context

**MVP Simplification**:
- ❌ Tags (deferred to Phase 2)
- ❌ Task linking (deferred to Phase 2)
- ✅ Note text + category only

**Success Criteria**: Note captured in under 12 seconds; user returns to original activity without context loss

---

### Flow 6: Analytics Review

**Trigger**: User navigates to Analytics

**Persona: Maya** 

**Frequency**: 1-2 times weekly

**Expected Duration**: 1-3 minutes

**Steps**:
1. User opens Analytics → System displays simple metrics
2. User views:
- Tasks created (this week)
- Tasks completed (this week + completion %)
- Tasks missed (this week)
- Mental notes created (this week)
3. User can tap metric for simple drill-down (list of tasks)

**MVP Simplification**:
- ❌ Coaching insights in natural language (deferred to Phase 2)
- ❌ Time estimate vs. actual accuracy (deferred to Phase 2)
- ❌ Category breakdown visualizations (deferred to Phase 2)
- ✅ Raw metrics only: created, completed, missed, completion %, notes count

**Success Criteria**: User reviews analytics at least once per week

---

## 6. MVP Scope - Phase 1

### Scope Philosophy

**Rule of thumb**: 3-5 truly P1 user-facing capabilities in MVP; anything else is phased.

For a 2-engineer team in 8-10 weeks.

### Core Features (MUST HAVE - P1)

1. **Task CRUD with Core Attributes**
    - As Maya, I want to create, view, edit, and delete tasks with title, category, priority, and due date
    - **Why P1**: Foundational capability; no product without this
    - **Acceptance Criteria**:
        - [ ]  User can create task with all fields in <30 seconds
        - [ ]  6 categories visually distinct and one-tap selectable
        - [ ]  3 priority levels with visual indicators
        - [ ]  Tasks display in Pending/Completed/Missed views
        - [ ]  Swipe-to-complete gesture works reliably
2. **Rule-Based Rescheduling**
    - As Maya, I want the system to suggest a new time for missed tasks so I can quickly recover
    - **Why P1**: Core differentiator
    - **Acceptance Criteria**:
        - [ ]  System automatically flags tasks as missed when deadline passes
        - [ ]  Rescheduling modal appears with one-tap access
        - [ ]  Suggestion generated via deterministic rules (priority + category + time buckets)
        - [ ]  Brief rationale shown (1 sentence)
        - [ ]  User can accept, adjust, or skip in <15 seconds
3. **Basic Nudges (2 Types)**
    - As Maya, I want to receive occasional nudges that help me stay on track
    - **Why P1**: Key differentiator, but scoped to 2 proven nudge types
    - **Acceptance Criteria**:
        - [ ]  Pattern-based nudge fires when 3+ missed in category
        - [ ]  Momentum nudge fires when 2+ completed today
        - [ ]  Rate-limited to 3/day maximum
        - [ ]  User can act or dismiss
        - [ ]  Engagement tracked
4. **Simple Mental Note Capture**
    - As Maya, I want to quickly capture ideas with a category
    - **Why P1**: Differentiator; but simplified to text + category only
    - **Acceptance Criteria**:
        - [ ]  Quick-capture accessible from any screen (FAB)
        - [ ]  6 categories available with one-tap selection
        - [ ]  Capture completes in <12 seconds
        - [ ]  Notes viewable in list with category filter
5. **Dashboard with Raw Metrics**
    - As Maya, I want to see my day at a glance
    - **Why P1**: Critical for engagement
    - **Acceptance Criteria**:
        - [ ]  Shows today’s date and greeting
        - [ ]  Shows 3 metrics: tasks today, completed, missed
        - [ ]  Shows top 3 priority tasks as preview cards
        - [ ]  Active nudges displayed
        - [ ]  Page loads in <2 seconds

### Explicitly OUT of Scope (Phase 2+)

| Feature | Reason for Deferral | Phase |
| --- | --- | --- |
| Coaching insights (natural language) | Adds complexity; raw metrics sufficient for validation | 2 |
| Content/multitasking nudges | Start with 2 nudge types; expand based on engagement data | 2 |
| Tags for mental notes | Category is sufficient for MVP capture friction | 2 |
| Task linking for notes | Adds UI complexity; validate note capture first | 2 |
| Time estimate vs. actual | Adds input friction; defer until core loop proven | 2 |
| Category breakdown charts | Raw numbers sufficient; polish later | 2 |
| Push notifications | Requires PWA service workers; add after retention validated | 2 |
| Recurring tasks | State complexity; manual creation acceptable for MVP | 2 |
| Calendar integrations | OAuth complexity; add after core value proven | 2 |
| Team collaboration | Entirely different product; Phase 3+ | 3 |
| ML-based suggestions | Need data first; heuristics sufficient for MVP | 3 |

### Definition of “MVP Done”

✅ Maya can manage daily tasks with CRUD, experience rule-based rescheduling, receive 2 types of nudges, capture mental notes (text + category), and view raw metrics

✅ Core flow (task creation → completion or rescheduling) completes without errors 95% of time

✅ Day-7 retention reaches 35%+ in beta cohort

✅ Technical foundation supports 5,000 concurrent users

✅ Lighthouse mobile performance score ≥80

### Launch Criteria

- [ ]  Usability testing with N=12 users shows 80%+ task completion for core flows
- [ ]  Task creation averages <30 seconds
- [ ]  Page load <2 seconds on 3G
- [ ]  No P0/P1 bugs in core flows
- [ ]  Analytics instrumentation tracking all key events
- [ ]  Onboarding completion rate >60% in internal testing

---

## 7. Features & Requirements

### Functional Requirements

| ID | Feature | Description | Priority | Est. Effort |
| --- | --- | --- | --- | --- |
| F1 | User Authentication | Email/password signup and login | P1 | 1 week |
| F2 | Task CRUD | Create, read, update, delete with all attributes | P1 | 1.5 weeks |
| F3 | Task Status Management | Pending/Completed/Missed states | P1 | 0.5 week |
| F4 | Rule-Based Rescheduling | Heuristic suggestions for missed tasks | P1 | 1 week |
| F5 | Dashboard | Today view with metrics and task previews | P1 | 1 week |
| F6 | Basic Nudges | 2 nudge types with act/dismiss | P1 | 1 week |
| F7 | Mental Notes | Quick capture with categories | P1 | 1 week |
| F8 | Raw Analytics | Simple metrics display | P1 | 0.5 week |
| F9 | Responsive UI | Mobile-first, works 320-1440px | P1 | Continuous |

### Non-Functional Requirements

- **Performance**: Page load <2s on 3G, <1s on 4G; API response <500ms
- **Scalability**: Support 5,000 concurrent users in Phase 1
- **Security**: HTTPS, password hashing (bcrypt), JWT auth, input sanitization
- **Reliability**: 99% uptime, graceful offline degradation
- **Accessibility**: WCAG 2.1 AA, touch targets 44x44px minimum

---

## 8. Tech Stack Recommendation

### Frontend

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State**: Zustand (lightweight)
- **Animations**: Framer Motion

### Backend

- **Platform**: Supabase (Auth + Database + Edge Functions)
- **Database**: PostgreSQL (via Supabase)
- **Justification**: All-in-one platform eliminates DevOps overhead for small team

### Hosting

- **Frontend**: Vercel (free tier)
- **Backend**: Supabase (free tier: 500MB DB, 50K MAU)

### Third-Party Services

| Service | Purpose | Cost (MVP) |
| --- | --- | --- |
| Supabase | Auth, DB, Functions | Free |
| Vercel | Frontend hosting | Free |
| Sentry | Error tracking | Free (5K events) |
| Mixpanel | Analytics | Free (20M events) |
| SendGrid | Email (password reset) | Free (100/day) |

### Intelligence Approach (No ML in MVP)

**Critical clarification**: We will NOT train or host custom ML models in MVP. All “intelligence” is deterministic heuristics.

**v1 Rescheduling Algorithm**:

```jsx
IF task.priority = HIGH:
    suggest = next_morning_slot (9 AM next available day)
ELSE IF task.category = HEALTH:
    suggest = next_early_morning (7 AM)
ELSE IF task.category = WORK:
    suggest = next_weekday_morning
ELSE:
    suggest = same_time_tomorrow

IF user has 2+ weeks of data:
    adjust based on: most_successful_time_bucket_for_category
```

**v1 Nudge Rules**:

```jsx
PATTERN NUDGE:
    trigger: count_missed_this_week(category) >= 3
    message: "You've missed {n} {category} tasks. Schedule one?"

MOMENTUM NUDGE:
    trigger: count_completed_today >= 2 AND has_pending_tasks
    message: "Great momentum! One more before EOD?"
```

**Phase 2 upgrade path**: Once we have 10K+ users with 30+ days of data, evaluate simple ML models (logistic regression for optimal time prediction).

---

## 8.1 Supabase Integration & Database Schema

### Overview

Smart Scheduler uses Supabase as the complete backend platform, leveraging:
- **Supabase Auth**: Email/password authentication with JWT tokens
- **PostgreSQL Database**: Relational data storage with Row Level Security
- **Edge Functions**: Serverless functions for business logic (rescheduling, nudge generation)
- **Realtime**: Live updates for task status changes (Phase 2)

### Database Schema

### Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    users     │────<│      tasks       │>────│ task_categories │
└──────────────┘     └──────────────────┘     └─────────────────┘
       │                    │ │
       │                    │ └───────────────────────┐
       │                    │                         │
       │             ┌──────┴──────┐          ┌───────┴───────┐
       │             │             │          │task_priorities│
       │             ▼             ▼          └───────────────┘
       │     ┌──────────────┐  ┌──────────────────┐
       │────<│    nudges    │  │task_activity_logs│
       │     └──────────────┘  └──────────────────┘
       │
       │     ┌──────────────┐     ┌────────────────────┐
       │────<│ mental_notes │>────│mental_note_categories│
       │     └──────────────┘     └────────────────────┘
       │
       │     ┌─────────────────────┐
       │────<│productivity_snapshots│
       │     └─────────────────────┘
       │
       │     ┌──────────────┐
       └────<│user_settings │
             └──────────────┘
```

### Table Summary

| **Entity** | **Purpose** | **Key Relationships** |
| --- | --- | --- |
| users | User profiles (extends Supabase auth) | Has many tasks, nudges, notes, settings |
| tasks | Core task records with CRUD + status tracking | Belongs to user, category, priority; has activity logs |
| task_categories | 6 predefined categories (lookup) | Learning, Work, Health, Personal, Information, Creative |
| task_priorities | 3 priority levels (lookup) | High (weight 3), Medium (2), Low (1) |
| nudges | Generated nudge records | Pattern and momentum types; tracks act/dismiss/expire |
| mental_notes | Quick-capture notes | 6 categories; timestamped; filterable |
| mental_note_categories | Note category lookup | Content Ideas, Insights, Quotes, Action Items, Observations, Questions |
| task_activity_logs | Immutable event log for analytics | Tracks all status changes with payload context |
| productivity_snapshots | Daily aggregate metrics | Pre-computed for fast analytics queries |
| user_settings | Per-user preferences | Work hours, nudge frequency, reschedule preferences |

### Edge Functions **(Serverless Business Logic)**

Three Supabase Edge Functions handle the core intelligence layer:

| **Function** | **Purpose** | **Input** | **Output** |
| --- | --- | --- | --- |
| generate-reschedule-suggestion | Generates optimal reschedule time for missed tasks using heuristic rules + user history | task_id | suggested_datetime, rationale, confidence score |
| generate-nudges | Evaluates nudge trigger rules with rate limiting (3/day max) | user_id | Array of generated nudge objects |
| calculate-daily-snapshot | Aggregates daily productivity metrics (cron: midnight) | Triggered automatically | Upserted productivity_snapshot record |

---

## 9. UI/UX Specification

### Design Philosophy

- **Mobile-first**: Design for 375px width, Maya on iPhone
- **Gradient-based**: Modern, warm gradients for visual appeal
- **Minimal chrome**: Maximum content, minimal UI overhead
- **Instant feedback**: Every action acknowledged within 100ms

### Key Screens (MVP)

### 1. Dashboard

- Header: Date, greeting
- Metrics row: 3 cards (Today’s Tasks, Completed, Missed)
- Today’s priorities: 3 task cards
- Active nudges: 1-2 nudge cards
- Bottom nav: Dashboard, Tasks, Notes, Analytics

### 2. Task Management

- Tab bar: Pending | Completed | Missed
- Task list with category stripes
- FAB: Add task
- Swipe gestures: Right = complete, Left = miss

### 3. Mental Notes

- Category filter chips
- Note list (text preview + category + timestamp)
- FAB: Quick capture

### 4. Quick Capture Modal

- Large text input (auto-focus)
- 6 category chips
- Save button

### 5. Analytics

- 4 metric cards with numbers only
- Tap for drill-down list

### Design System

**Colors**:
- Primary: #667eea → #764ba2 (gradient)
- Success: #22c55e, Warning: #f97316, Error: #ef4444
- Category: Learning (#3b82f6), Work (#8b5cf6), Health (#22c55e), Personal (#ec4899), Information (#f59e0b), Creative (#06b6d4)

**Typography**: Inter (headings), system-ui (body)

**Spacing**: 4px base (4/8/12/16/24/32px)

---

## 10. Go-to-Market Strategy (MVP)

### Geographic Focus

- **Primary**: India Tier-1 cities (Bangalore, Mumbai, Delhi NCR, Hyderabad)
- **Secondary**: San Francisco Bay Area, London
- **Rationale**: High concentration of target persona; English-speaking; strong creator/professional overlap

### Acquisition Channels

| Channel | Tactics | Potential Target | Budget |
| --- | --- | --- | --- |
| **Product Hunt** | Launch during India-friendly hours; prepare assets | 2,000 signups | $0 |
| **LinkedIn organic** | Founder thought leadership; 3x/week posts on productivity | 3,000 signups | $0 |
| **Reddit/IndieHackers** | Authentic engagement in r/productivity, r/Notion, r/India | 1,500 signups | $0 |
| **Twitter/X** | Build-in-public thread; engage productivity community | 1,500 signups | $0 |
| **Referral program** | “Invite 3 friends, unlock extended analytics” | 2,000 signups | $0 |
| **Micro-influencers** | 5-10 Indian productivity YouTubers/creators | 3,000 signups | ₹50K-1L |
| **Targeted ads (stretch)** | LinkedIn/Instagram ads to Indian professionals | 2,000 signups | ₹1-2L |

**Total potential target**: 15,000 signups in 6 months (stretch: 25,000 with paid ads)

### Onboarding Strategy

**Activation Definition**: User has created ≥3 tasks AND completed ≥1 task within 48 hours

**First-Session Experience**:
1. Welcome screen with value prop (5 seconds)
2. Choose archetype: “Content Creator” or “Busy Professional”
3. System pre-loads 3-5 starter tasks based on archetype:
     - Content Creator: “Review content ideas”, “Draft LinkedIn post”, “Capture 3 insights from podcast”
     - Busy Professional: “Review today’s priorities”, “Clear inbox to zero”, “15-min exercise”
4. User completes one pre-loaded task (guided)
5. System celebrates completion, explains rescheduling
6. User creates their first custom task

**Target**: First-session value in <3 minutes; 60%+ onboarding completion

### Referral Mechanics

- User invites friend via unique link
- When friend signs up and activates (3 tasks + 1 completion):
    - Inviter unlocks “Weekly Email Summary” (Phase 2 preview)
    - After 3 successful referrals: unlock “Category Analytics” (Phase 2 preview)
- Viral coefficient target: 0.3 (each user brings 0.3 new users)

---

## 11. Success Metrics

### North Star Metric

**Weekly Active Task Completions (WATC)**: Tasks marked complete per active user per week
- Target: 8+ completions per active user per week by Month 6

### Target Metrics (Realistic for MVP)

| Metric | 3-Month Target | 6-Month Target | Stretch |
| --- | --- | --- | --- |
| **Registered Users** | 5,000 | 15,000 | 25,000 |
| **MAU** | 1,500 | 5,000 | 8,000 |
| **DAU/MAU Ratio** | 20% | 25% | 30% |
| **Day-7 Retention** | 35% | 40% | 50% |
| **Day-30 Retention** | 18% | 25% | 35% |
| **Activation Rate** | 50% | 60% | 70% |
| **Task Completion Rate** | 55% | 60% | 70% |
| **Rescheduling Acceptance** | 55% | 65% | 75% |
| **Nudge Engagement** | 25% | 30% | 40% |
| **Notes/Active User/Week** | 2 | 3 | 5 |

### Segment-Specific Targets

- **Activated Users** (onboarded + 5 tasks): NPS target 45
- **All Users** (including churned): NPS target 30
- **System-Hoppers** (using 3+ tools before): D30 retention target 30% (vs. 25% overall)

### Leading Indicators

- **Onboarding completion** predicts D7 retention (expected correlation >0.6)
- **First-week task creation (5+)** predicts D30 retention
- **Rescheduling usage** predicts long-term retention
- **Note creation in session 1** predicts feature engagement

### Go / No-Go Thresholds

**30 days post-launch**:
- Day-7 retention ≥30% OR iterate heavily on onboarding
- Activation rate ≥40% OR revisit first-session experience
- 1,000 registered users OR increase marketing investment

**90 days post-launch**:
- Day-30 retention ≥18% OR pivot value proposition
- NPS (activated users) ≥25 OR conduct deep user research
- 3,000 MAU OR reassess market fit

**6 months post-launch**:
- 300+ users expressing premium interest OR reassess monetization path
- Task completion rate ≥55% OR reconsider differentiation

### Experimentation Roadmap (First 90 Days)

| Experiment | Hypothesis | Variants | Success Metric | Timeline |
| --- | --- | --- | --- | --- |
| **Onboarding: Templates vs. Blank** | Pre-loaded tasks increase activation | A: Starter templates, B: Blank slate | Activation rate (+10pp) | Week 1-4 |
| **Nudge Frequency** | 3/day is optimal; 2/day may be too few, 5/day causes fatigue | A: 2/day, B: 3/day | Engagement rate, D7 retention | Week 3-6 |
| **Mental Notes Tooltip** | Explaining “becomes content” increases note creation | A: With tooltip, B: Without | Notes created in first 3 sessions | Week 4-8 |

### Instrumentation Plan

**Analytics Tool**: Mixpanel

**Key Events**:
- `user_signup`, `onboarding_completed`, `onboarding_abandoned`
- `task_created`, `task_completed`, `task_missed`
- `reschedule_offered`, `reschedule_accepted`, `reschedule_adjusted`, `reschedule_skipped`
- `nudge_shown`, `nudge_acted`, `nudge_dismissed`
- `note_created`
- `session_start`, `session_end`

**User Properties**: `signup_date`, `activation_date`, `archetype_chosen`, `referral_source`, `tasks_lifetime`, `completion_rate_7d`

---

## 12. Assumptions & Risks

### Key Assumptions

| # | Assumption | Basis | Test Method |
| --- | --- | --- | --- |
| A1 | 15% of exposed users in target channels will sign up | Product Hunt/Reddit launch benchmarks | Launch metrics |
| A2 | Rule-based rescheduling accepted 55%+ without ML | User research indicates desire for “any suggestion is better than none” | In-app measurement |
| A3 | 2 nudge types are sufficient for MVP validation | Pattern + momentum cover core use cases | Engagement metrics |
| A4 | Mobile web is acceptable; users tolerate PWA vs. native | Cost of native prohibitive; PWA adoption growing | Retention comparison, feedback |
| A5 | Indian market is viable primary launch market | Large English-speaking professional base; lower CAC | Geographic cohort analysis |
| A6 | 2 engineers can ship scoped MVP in 10 weeks | Scope is minimal; Supabase reduces backend work | Sprint velocity |
| A7 | Category-only mental notes (no tags) have sufficient utility | “Capture first, organize later” is validated pattern | Note creation rate |

### Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| **Rescheduling feels “dumb”** | Medium | High | Start with sensible defaults; iterate rapidly based on acceptance data; clear “v1” messaging |
| **Nudge fatigue** | Medium | Medium | Strict rate limiting (3/day); track dismissal velocity; add preferences in Phase 2 |
| **PWA limitations on iOS** | Medium | Medium | Monitor Safari-specific issues; prepare native app plan if D7 <30% on iOS |
| **India market different than expected** | Low | Medium | Run geographic cohort analysis; pivot to US-first if India retention significantly lower |
| **Team velocity slower** | Medium | Medium | Buffer in timeline; PM maintains ruthless backlog prioritization |
| **Users expect “AI magic”** | Medium | Medium | Clear messaging: “smart rules” not “AI”; set expectations in onboarding |

### Failure Modes

**Scenario 1: Users create tasks but never return**
- Warning: Day-1 retention <40%, session count <2 in first week
- Response: User interviews; revisit onboarding; test push notifications (Phase 2)

**Scenario 2: Users ignore rescheduling**
- Warning: Acceptance <40%; manual deletion >40%
- Response: Improve suggestion quality; add feedback mechanism; consider removing if fundamentally broken

**Scenario 3: Mental notes unused**
- Warning: <1 note per active user per week
- Response: Improve FAB visibility; test onboarding tutorial; consider deprioritizing feature

---

## 13. Business Model & Pricing

### Pricing Philosophy

- **No ads**: We will never run ads; this is a trust-based productivity tool
- **Freemium with clear upgrade path**: Free tier is genuinely useful; premium unlocks power features

### Free Tier (MVP)

- Unlimited tasks
- Rule-based rescheduling
- 2 nudge types (3/day max)
- 100 mental notes/month
- Basic metrics (created, completed, missed, completion %)

### Premium Tier (Phase 2 - $9-14/month or ₹499-999/month)

- Unlimited mental notes
- Advanced analytics (time accuracy, category breakdown, trends)
- Custom nudge preferences
- Weekly email summary
- Priority support
- Future: Calendar integrations, export, API access

### Phase 1 Learning Goals

- **By Month 3**: Run at least one pricing experiment:
    - In-app survey: “Would you pay $X/month for [feature]?”
    - Fake paywall test: Show premium features with “Coming soon - join waitlist”
    - Measure: Waitlist signups, survey responses, feature click-through
- **Validate**: Is $9-14/month (₹499-999) realistic for Maya?

### Revenue Projections (Conservative)

| Milestone | Users | Conversion | ARPU | MRR |
| --- | --- | --- | --- | --- |
| Month 6 | 5,000 MAU | 2% (waitlist) | - | $0 (validation) |
| Month 9 | 10,000 MAU | 3% | $10 | $3,000 |
| Month 12 | 20,000 MAU | 4% | $11 | $8,800 |

**Break-even target**: ~$8,000 MRR (covers 2 engineers + infrastructure)

---

## 14. Potential Development Timeline

### Phase 1: MVP (Weeks 1-10)

**Sprint 0 (Week 1)**: Foundation
- [ ] Repo, CI/CD, Vercel + Supabase setup
- [ ] Design system (Tailwind config, components)
- [ ] Database schema
- [ ] Auth flow (Supabase Auth)

**Sprint 1 (Weeks 2-3)**: Core Tasks
- [ ] Task CRUD API
- [ ] Task creation UI
- [ ] Task list with status filtering
- [ ] Swipe gestures

**Sprint 2 (Weeks 4-5)**: Dashboard + Rescheduling
- [ ] Dashboard UI with metrics
- [ ] Missed task detection
- [ ] Rescheduling algorithm (rules-based)
- [ ] Rescheduling modal

**Sprint 3 (Weeks 6-7)**: Nudges + Notes
- [ ] Nudge engine (2 types)
- [ ] Nudge display + interactions
- [ ] Mental note capture
- [ ] Note list view

**Sprint 4 (Weeks 8-9)**: Analytics + Polish
- [ ] Raw metrics display
- [ ] Onboarding flow with templates
- [ ] UI polish + animations
- [ ] Performance optimization

**Sprint 5 (Week 10)**: Launch
- [ ] Beta testing (30 users)
- [ ] Bug fixes
- [ ] Analytics verification
- [ ] Product Hunt prep
- [ ] Soft launch

### Key Milestones

| Milestone | Date | Success Criteria |
| --- | --- | --- |
| Internal alpha | Week 6 | Core flows work, team dogfooding |
| Beta launch | Week 8 | 30 beta users, structured feedback |
| Public launch | Week 10 | Live, 500 signups in week 1 |
| PMF signal | Month 3 | D7 35%+, completion rate 55%+ |
| Premium validation | Month 6 | 300+ waitlist signups |

### Probable Team & Budget

**Team**:
- 1 PM
- 2 Full-stack Engineers
- 1 Designer (contract, part-time)

**Budget (6 months)**:
- Personnel: $50,000-$80,000 (varies by geography)
- Infrastructure: $0-$500 (free tiers)
- Marketing: $5,000-$10,000
- **Total**: $55,000-$90,000

---

## Appendix

### Competitive Positioning

| Dimension | Smart Scheduler | Todoist | Notion | Things |
| --- | --- | --- | --- | --- |
| Core use case | Task + behavior coaching | Task lists | Everything workspace | Task lists |
| Intelligence | Rules-based suggestions | None | None | None |
| Idea capture | First-class (notes) | No | Yes (but heavy) | No |
| Learning curve | Zero | Low | High | Low |
| Mobile experience | Optimized | Good | Poor | Excellent |
| Price | Free / $9-14 | Free / $5 | Free / $10 | $50 |

**Positioning statement**: “Smart Scheduler is for productivity tool power-users who are tired of manually managing their task backlogs. We’re the intelligent layer that Todoist and Notion are missing.”

### Glossary

- **Activated User**: Created ≥3 tasks AND completed ≥1 within 48 hours
- **System-Hopper**: User currently using 3+ productivity tools
- **WATC**: Weekly Active Task Completions
- **Heuristic**: Rule-based logic (not machine learning)

---