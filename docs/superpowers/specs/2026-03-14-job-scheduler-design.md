# Job Scheduler — Design Spec

**Author:** Anil Khanna
**Date:** 2026-03-14
**Status:** Approved
**Source PRD:** docs/jobs.prd

---

## 1. Overview

An automated job scheduler integrated into the portfolio site at `anilkhanna.dev/jobs`. Fetches job listings from Indeed every 8 hours, scores them against a configurable profile, and provides a private single-column dashboard to review, save, and track applications.

### Goals

- Automate job discovery from Indeed (pluggable for future sources)
- Match jobs against editable skills, role preferences, and location
- Provide a private dashboard to review and manage opportunities
- Zero recurring costs (all free-tier services)

### Non-Goals

- Auto-applying to jobs
- Resume/cover letter generation
- Multi-platform fetching in v1 (LinkedIn, StepStone deferred)
- Two-panel dashboard layout

---

## 2. Architecture

```
┌──────────────────────────────────────────────────┐
│              Indeed (JSearch API)                  │
│              4 queries per run                     │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│       Vercel Cron (every 8 hours)                 │
│       GET /api/jobs/cron                          │
│                                                   │
│  ┌─────────────┐    ┌──────────────────────┐     │
│  │  Fetcher    │───▶│  Profile Matcher      │     │
│  │  (pluggable)│    │  (config from DB)     │     │
│  └─────────────┘    └──────────┬───────────┘     │
└────────────────────────────────┼──────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────┐
│           Vercel Postgres (Neon)                   │
│  ┌──────┐  ┌──────────┐  ┌────────────────┐     │
│  │ jobs │  │ cron_logs │  │ profile_config │     │
│  └──────┘  └──────────┘  └────────────────┘     │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│       anilkhanna.dev/jobs (Dashboard)             │
│  ┌────────┐ ┌──────────────┐ ┌──────────┐       │
│  │ Stats  │ │ Job Cards    │ │ Settings │       │
│  │ Bar    │ │ (expandable) │ │ Panel    │       │
│  └────────┘ └──────────────┘ └──────────┘       │
└──────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 | Existing portfolio stack |
| Backend | Next.js API Routes + Server Actions | Same codebase, zero infra |
| Database | Vercel Postgres (Neon) | Stays in Vercel ecosystem, free tier |
| Scheduler | Vercel Cron | Built-in, free on Hobby plan |
| Job API | RapidAPI JSearch | Free tier (500 req/month) |
| Auth | Existing admin auth (cookie-based) | Reuses `/api/admin/auth` |
| Deployment | Vercel (auto-deploy from GitHub) | Existing CI/CD pipeline |

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data source | Indeed only (v1) | SerpAPI free tier too small; validate concept first |
| Database | Vercel Postgres over Supabase | Stays in Vercel ecosystem, fewer external deps |
| Auth | Reuse existing admin auth | Same password, same cookie, zero new code |
| UI layout | Single-column expandable cards | Consistent with portfolio style, better mobile UX |
| Profile config | Database-stored, editable via dashboard | Tune matching without redeploying |
| Cron interval | Every 8 hours (3 runs/day) | Fits within JSearch free tier (~360 req/month) |

---

## 3. Database Schema

### Table: `jobs`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK, default gen) | |
| `external_id` | TEXT | Platform-specific job ID |
| `platform` | TEXT | `indeed` (extensible) |
| `title` | TEXT | |
| `company` | TEXT | |
| `location` | TEXT | |
| `job_url` | TEXT | |
| `description` | TEXT | Truncated to 5000 chars |
| `salary_range` | TEXT | Nullable |
| `job_type` | TEXT | full-time, part-time, contract |
| `work_mode` | TEXT | remote, hybrid, onsite |
| `match_score` | NUMERIC(5,2) | 0-100 |
| `matched_skills` | TEXT[] | |
| `status` | TEXT | new, reviewed, saved, applied, rejected |
| `notes` | TEXT | Nullable |
| `posted_at` | TIMESTAMPTZ | |
| `discovered_at` | TIMESTAMPTZ | Default now() |
| `updated_at` | TIMESTAMPTZ | Auto-updated |

**Unique constraint:** `(external_id, platform)`

### Table: `cron_logs`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `ran_at` | TIMESTAMPTZ | |
| `jobs_found` | INTEGER | |
| `jobs_new` | INTEGER | |
| `jobs_updated` | INTEGER | |
| `errors` | TEXT[] | |
| `duration_ms` | INTEGER | |
| `status` | TEXT | success, partial, failed |

### Table: `profile_config`

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (PK) | Single row, key = `default` |
| `target_roles` | JSONB | `[{role, priority}]` |
| `primary_skills` | TEXT[] | High-weight skills (5 pts each) |
| `secondary_skills` | TEXT[] | Lower-weight skills (2 pts each) |
| `negative_keywords` | TEXT[] | -15 pts each |
| `location_prefs` | JSONB | `{munich_onsite, hybrid_germany, remote}` booleans |
| `weights` | JSONB | Point values per scoring factor |
| `min_score` | INTEGER | Discard threshold (default 15) |
| `updated_at` | TIMESTAMPTZ | |

---

## 4. API Endpoints

All `/api/jobs/*` routes verify the existing admin auth cookie (from `/api/admin/auth`). The cron endpoint uses `CRON_SECRET` bearer token instead.

### Jobs CRUD

**GET `/api/jobs`** — List jobs
- Query params: `status`, `platform`, `search`, `sort`, `order`, `page`, `limit`
- Returns: `{ jobs, total, page, totalPages }`

**PATCH `/api/jobs`** — Update job status or notes
- Body: `{ id, status?, notes? }`
- Returns: `{ job }`

**DELETE `/api/jobs?id=uuid`** — Delete a job
- Returns: `{ success: true }`

### Stats

**GET `/api/jobs/stats`** — Dashboard stats
- Returns: `{ stats: { total, new, saved, applied, rejected }, lastRun: {...} }`

### Cron

**GET `/api/jobs/cron`** — Trigger job fetch
- Auth: `CRON_SECRET` bearer token
- Manual trigger: server action injects secret server-side
- Returns: `{ success, stats: { fetched, matched, new_jobs, updated } }`

### Profile Config

**GET `/api/jobs/config`** — Get profile config
- Returns: `{ config }`

**PUT `/api/jobs/config`** — Update profile config
- Body: full profile_config object
- Returns: `{ config }`

---

## 5. Fetcher Architecture

### Interface

```typescript
interface JobFetcher {
  platform: string;
  enabled: boolean;
  fetch(queries: string[]): Promise<RawJob[]>;
}
```

### Indeed Fetcher (v1)

- API: JSearch on RapidAPI (`jsearch.p.rapidapi.com/search`)
- 4 queries per run derived from `profile_config.target_roles`
- Filters: country=Germany, date_posted=week
- 500ms delay between requests
- Maps JSearch response to `RawJob` format

### Aggregator Flow

1. Load enabled fetchers
2. Build search queries from `profile_config.target_roles`
3. Run fetchers (parallel when multiple enabled)
4. Deduplicate by `platform + external_id`
5. Score through profile matcher
6. Discard below `min_score`
7. Upsert into database (only update jobs still in `new` status)

### Adding Future Fetchers

1. Create `lib/jobs/fetchers/<platform>.ts` implementing `JobFetcher`
2. Register in the aggregator
3. Cron picks it up automatically

---

## 6. Profile Matcher

Reads all config from the `profile_config` database table.

| Factor | Max Points | Logic |
|--------|-----------|-------|
| Primary skills match | 40 | 5 pts per matched skill, capped at 40 |
| Role title match | 20 | Exact match on high-priority target role |
| Title keywords | 10 | 3 pts per keyword from target roles |
| Secondary skills match | 15 | 2 pts per matched skill, capped at 15 |
| Location match | 10 | Based on location_prefs + job work_mode/location |
| Bonus keywords | 10 | 2 pts each (fintech, startup, etc.) |
| Seniority match | 5 | Contains "senior", "lead", "10+ years" |
| Negative keywords | -15 each | From config.negative_keywords |

Score clamped to 0-100. Jobs below `config.min_score` (default 15) are discarded.

---

## 7. Dashboard UI

### Auth

Reuses existing admin auth. If logged in to admin panel, already authenticated for jobs. Otherwise, redirects to password prompt styled in portfolio theme.

### Layout (Single Column)

**Top Bar (sticky):**
- Back arrow to portfolio
- "Job Scheduler" title
- "Fetch Now" button + last run timestamp
- Settings gear icon
- Logout button

**Stats Bar:**
- 5 stat cards: Total, New, Saved, Applied, Rejected
- Color-coded per status

**Filter Bar:**
- Search input (title, company, description)
- Status dropdown (All, New, Reviewed, Saved, Applied, Rejected)
- Sort dropdown (Match Score, Newest, Company)

**Job Cards (expandable):**

Collapsed:
- Match score badge (green >=70, yellow >=50, gray >=30)
- Title + company + location + work mode
- Discovered time (relative)
- Status badge
- Quick action buttons on hover (save, reject)

Expanded (click to toggle):
- Full description (scrollable)
- Matched skills pills
- Salary (if available)
- Notes textarea (auto-saves on blur)
- Status action buttons: New -> Reviewed -> Saved -> Applied / Rejected
- "Open Job Posting" external link button

**Settings Panel (separate view or modal):**
- Edit target roles and priorities
- Edit primary/secondary skills
- Edit negative keywords
- Adjust scoring weights
- Set minimum score threshold
- Save button

### Responsive

- Desktop: single column, max-width ~800px centered
- Mobile: full-width cards, same expand/collapse

### Theme

Matches existing portfolio dark theme:
- Background: `#0a0a0a`
- Surface: `#0a0f1c`
- Accent: `#64ffda`
- Text primary: `#ccd6f6`
- Text secondary: `#8892b0`

Match score colors: green (`#64ffda`) >=70, yellow (`yellow-400`) >=50, gray (`#8892b0`) >=30, muted (`#4a5568`) <30.

Platform color: Indeed blue (`#2164f3`).

---

## 8. File Structure

```
src/
├── app/
│   ├── api/jobs/
│   │   ├── cron/route.ts          # Cron endpoint (CRON_SECRET auth)
│   │   ├── stats/route.ts         # Dashboard stats
│   │   ├── config/route.ts        # Profile config GET/PUT
│   │   └── route.ts               # Jobs CRUD (GET, PATCH, DELETE)
│   └── jobs/
│       ├── components/
│       │   ├── JobCard.tsx         # Expandable job card
│       │   ├── JobsDashboard.tsx   # Main dashboard component
│       │   ├── StatsBar.tsx        # Stats overview bar
│       │   ├── FilterBar.tsx       # Search + dropdowns
│       │   └── SettingsPanel.tsx   # Profile config editor
│       ├── actions.ts              # Server actions (fetch now, etc.)
│       ├── layout.tsx              # Metadata (noindex)
│       └── page.tsx                # Entry point (auth check)
├── lib/jobs/
│   ├── fetchers/
│   │   ├── index.ts               # Aggregator + dedup
│   │   └── indeed.ts              # Indeed via JSearch
│   ├── matcher.ts                 # Profile matching engine
│   ├── db.ts                      # Vercel Postgres client + queries
│   └── types.ts                   # Shared types
vercel.json                         # Cron schedule (0 */8 * * *)
schema.sql                          # Database schema
.env.example                        # Environment variables reference
```

---

## 9. Environment Variables

| Variable | Required | Source |
|----------|----------|--------|
| `admin_password` | Yes | Existing in Vercel env |
| `POSTGRES_URL` | Yes | Vercel Postgres (auto-provisioned) |
| `CRON_SECRET` | Yes | `openssl rand -hex 32` |
| `RAPIDAPI_KEY` | Yes | RapidAPI JSearch subscription |

---

## 10. Security

- Dashboard protected by existing admin auth (password + HTTP-only cookie)
- Page has `robots: { index: false, follow: false }` meta tags
- Cron endpoint protected by CRON_SECRET bearer token
- Vercel Postgres credentials managed by Vercel (never in client code)
- "Fetch Now" uses server action (CRON_SECRET stays server-side)
- No sensitive data in repo (all env variables)

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| JSearch rate limit (500/month) | 4 queries x 3 runs/day = ~360/month, well within limit |
| Job URLs expire | Mark as expired during next cron run |
| False positive matches | Profile config editable from dashboard, tune weights over time |
| Vercel cold starts | `maxDuration: 60` config, parallel fetching within the run |
| Vercel Postgres free tier fills | Periodically archive old rejected/expired jobs |

---

## 12. Future Enhancements (out of scope)

- LinkedIn fetcher (SerpAPI)
- StepStone fetcher (SerpAPI + direct)
- Email/push notifications for high-score jobs
- AI-powered job description analysis
- Analytics dashboard with trends
- More platforms (Glassdoor, XING)
