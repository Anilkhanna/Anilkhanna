# Job Scheduler Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an automated job scheduler at `/jobs` that fetches Indeed listings every 8 hours, scores them against a configurable profile, and provides a private dashboard to review and manage applications.

**Architecture:** Next.js API routes + Vercel Cron trigger an Indeed fetcher → profile matcher → Vercel Postgres pipeline. A single-column expandable-card dashboard lets the user filter, review, and track jobs. All config (skills, roles, weights) lives in the database and is editable from a settings panel.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vercel Postgres (Neon), Vercel Cron, RapidAPI JSearch

**Spec:** `docs/superpowers/specs/2026-03-14-job-scheduler-design.md`

---

## File Map

| File | Responsibility |
|------|---------------|
| `schema.sql` | Database DDL for jobs, cron_logs, profile_config tables |
| `.env.example` | Documents required environment variables |
| `vercel.json` | Vercel cron schedule configuration |
| `src/lib/jobs/types.ts` | Shared TypeScript types and interfaces |
| `src/lib/jobs/db.ts` | Vercel Postgres client, all DB query functions |
| `src/lib/jobs/matcher.ts` | Profile matching/scoring engine |
| `src/lib/jobs/fetchers/indeed.ts` | Indeed fetcher via JSearch API |
| `src/lib/jobs/fetchers/index.ts` | Fetcher aggregator, dedup, orchestration |
| `src/app/api/jobs/route.ts` | Jobs CRUD API (GET, PATCH, DELETE) |
| `src/app/api/jobs/stats/route.ts` | Dashboard stats endpoint |
| `src/app/api/jobs/config/route.ts` | Profile config GET/PUT |
| `src/app/api/jobs/cron/route.ts` | Cron endpoint (fetcher trigger) |
| `src/app/jobs/layout.tsx` | Jobs page metadata (noindex) |
| `src/app/jobs/page.tsx` | Entry point with auth check |
| `src/app/jobs/actions.ts` | Server actions (fetch now, logout) |
| `src/app/jobs/components/LoginScreen.tsx` | Password auth gate |
| `src/app/jobs/components/StatsBar.tsx` | Stats overview cards |
| `src/app/jobs/components/FilterBar.tsx` | Search + filter dropdowns |
| `src/app/jobs/components/JobCard.tsx` | Expandable job card |
| `src/app/jobs/components/SettingsPanel.tsx` | Profile config editor |
| `src/app/jobs/components/JobsDashboard.tsx` | Main dashboard orchestrator |

---

## Chunk 1: Foundation (Database, Types, Config)

### Task 1: Project setup — dependencies, env, schema

**Files:**
- Modify: `package.json` (add @vercel/postgres)
- Create: `.env.example`
- Create: `schema.sql`
- Create: `vercel.json`

- [ ] **Step 1: Install @vercel/postgres**

Run: `npm install @vercel/postgres`

- [ ] **Step 2: Create `.env.example`**

```env
# Existing
ADMIN_PASSWORD=your-admin-password

# Vercel Postgres (auto-provisioned, add to .env.local for local dev)
POSTGRES_URL=postgres://...

# Job Scheduler
CRON_SECRET=generate-with-openssl-rand-hex-32
RAPIDAPI_KEY=your-rapidapi-jsearch-key
```

- [ ] **Step 3: Create `schema.sql`**

```sql
-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'indeed',
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_url TEXT NOT NULL,
  description TEXT,
  salary_range TEXT,
  job_type TEXT,
  work_mode TEXT,
  match_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  matched_skills TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  posted_at TIMESTAMPTZ,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(external_id, platform)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_match_score ON jobs(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_discovered_at ON jobs(discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_platform ON jobs(platform);

-- Cron logs table
CREATE TABLE IF NOT EXISTS cron_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  jobs_found INTEGER NOT NULL DEFAULT 0,
  jobs_new INTEGER NOT NULL DEFAULT 0,
  jobs_updated INTEGER NOT NULL DEFAULT 0,
  errors TEXT[] DEFAULT '{}',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success'
);

CREATE INDEX IF NOT EXISTS idx_cron_logs_ran_at ON cron_logs(ran_at DESC);

-- Profile config table (single row)
CREATE TABLE IF NOT EXISTS profile_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  target_roles JSONB NOT NULL DEFAULT '[]',
  primary_skills TEXT[] DEFAULT '{}',
  secondary_skills TEXT[] DEFAULT '{}',
  negative_keywords TEXT[] DEFAULT '{}',
  location_prefs JSONB NOT NULL DEFAULT '{}',
  weights JSONB NOT NULL DEFAULT '{}',
  min_score INTEGER NOT NULL DEFAULT 15,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profile_config_updated_at
  BEFORE UPDATE ON profile_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed default profile config
INSERT INTO profile_config (id, target_roles, primary_skills, secondary_skills, negative_keywords, location_prefs, weights, min_score)
VALUES (
  'default',
  '[
    {"role": "Senior Flutter Developer", "priority": "high"},
    {"role": "Senior iOS Developer", "priority": "high"},
    {"role": "Senior Full Stack Developer", "priority": "high"},
    {"role": "Senior React Developer", "priority": "medium"},
    {"role": "Mobile Lead", "priority": "medium"}
  ]'::jsonb,
  ARRAY['flutter', 'dart', 'ios', 'swift', 'react', 'nextjs', 'typescript', 'javascript', 'dotnet', 'csharp', 'nodejs'],
  ARRAY['objective-c', 'react-native', 'tailwind', 'postgresql', 'mongodb', 'firebase', 'rest', 'graphql', 'docker', 'aws', 'ci-cd', 'github-actions'],
  ARRAY['junior', 'intern', 'internship', 'php', 'wordpress', 'drupal', 'magento', 'trainee', 'werkstudent', 'praktikum'],
  '{"munich_onsite": true, "hybrid_germany": true, "remote": true}'::jsonb,
  '{"primary_skill": 5, "role_match": 20, "title_keyword": 3, "secondary_skill": 2, "location": 10, "bonus_keyword": 2, "seniority": 5, "negative": -15}'::jsonb,
  15
)
ON CONFLICT (id) DO NOTHING;
```

- [ ] **Step 4: Create `vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/jobs/cron",
      "schedule": "0 */8 * * *"
    }
  ]
}
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example schema.sql vercel.json
git commit -m "feat(jobs): add dependencies, schema, and config files"
```

---

### Task 2: Shared types

**Files:**
- Create: `src/lib/jobs/types.ts`

- [ ] **Step 1: Create types file**

```typescript
// Types shared across the job scheduler feature

export type JobStatus = 'new' | 'reviewed' | 'saved' | 'applied' | 'rejected' | 'expired';
export type CronStatus = 'success' | 'partial' | 'failed';
export type Platform = 'indeed';
export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type JobType = 'full-time' | 'part-time' | 'contract';
export type RolePriority = 'high' | 'medium' | 'low';

export interface Job {
  id: string;
  external_id: string;
  platform: Platform;
  title: string;
  company: string;
  location: string | null;
  job_url: string;
  description: string | null;
  salary_range: string | null;
  job_type: JobType | null;
  work_mode: WorkMode | null;
  match_score: number;
  matched_skills: string[];
  status: JobStatus;
  notes: string | null;
  posted_at: string | null;
  discovered_at: string;
  updated_at: string;
}

export interface RawJob {
  external_id: string;
  platform: Platform;
  title: string;
  company: string;
  location: string | null;
  job_url: string;
  description: string | null;
  salary_range: string | null;
  job_type: JobType | null;
  work_mode: WorkMode | null;
  posted_at: string | null;
}

export interface MatchResult {
  score: number;
  matched_skills: string[];
}

export interface TargetRole {
  role: string;
  priority: RolePriority;
}

export interface LocationPrefs {
  munich_onsite: boolean;
  hybrid_germany: boolean;
  remote: boolean;
}

export interface ScoringWeights {
  primary_skill: number;
  role_match: number;
  title_keyword: number;
  secondary_skill: number;
  location: number;
  bonus_keyword: number;
  seniority: number;
  negative: number;
}

export interface ProfileConfig {
  id: string;
  target_roles: TargetRole[];
  primary_skills: string[];
  secondary_skills: string[];
  negative_keywords: string[];
  location_prefs: LocationPrefs;
  weights: ScoringWeights;
  min_score: number;
  updated_at: string;
}

export interface CronLog {
  id: string;
  ran_at: string;
  jobs_found: number;
  jobs_new: number;
  jobs_updated: number;
  errors: string[];
  duration_ms: number;
  status: CronStatus;
}

export interface JobsListResponse {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
}

export interface StatsResponse {
  stats: {
    total: number;
    new: number;
    saved: number;
    applied: number;
    rejected: number;
  };
  lastRun: CronLog | null;
}

export interface JobFetcher {
  platform: Platform;
  enabled: boolean;
  fetch(queries: string[]): Promise<RawJob[]>;
}

export interface CronResult {
  success: boolean;
  stats: {
    fetched: number;
    matched: number;
    new_jobs: number;
    updated: number;
  };
  errors: string[];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/jobs/types.ts
git commit -m "feat(jobs): add shared TypeScript types"
```

---

### Task 3: Database client and query functions

**Files:**
- Create: `src/lib/jobs/db.ts`

- [ ] **Step 1: Create db.ts with all query functions**

```typescript
import { sql } from '@vercel/postgres';
import type {
  Job, JobStatus, ProfileConfig, CronLog,
  JobsListResponse, StatsResponse, RawJob, MatchResult,
} from './types';

// ── Jobs queries ──

interface ListJobsParams {
  status?: string;
  platform?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function listJobs(params: ListJobsParams): Promise<JobsListResponse> {
  const {
    status,
    platform,
    search,
    sort = 'match_score',
    order = 'desc',
    page = 1,
    limit = 20,
  } = params;

  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIdx = 1;

  if (status && status !== 'all') {
    conditions.push(`status = $${paramIdx++}`);
    values.push(status);
  }
  if (platform && platform !== 'all') {
    conditions.push(`platform = $${paramIdx++}`);
    values.push(platform);
  }
  if (search) {
    conditions.push(`(title ILIKE $${paramIdx} OR company ILIKE $${paramIdx} OR description ILIKE $${paramIdx})`);
    values.push(`%${search}%`);
    paramIdx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Validate sort column
  const sortColumns: Record<string, string> = {
    match_score: 'match_score',
    newest: 'discovered_at',
    company: 'company',
    title: 'title',
  };
  const sortCol = sortColumns[sort] || 'match_score';
  const sortDir = order === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  // Count query
  const countQuery = `SELECT COUNT(*) as count FROM jobs ${where}`;
  const countResult = await sql.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count, 10);

  // Data query
  const dataQuery = `SELECT * FROM jobs ${where} ORDER BY ${sortCol} ${sortDir} LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
  const dataResult = await sql.query(dataQuery, [...values, limit, offset]);

  return {
    jobs: dataResult.rows as Job[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateJob(
  id: string,
  updates: { status?: JobStatus; notes?: string }
): Promise<Job | null> {
  const sets: string[] = [];
  const values: (string)[] = [];
  let paramIdx = 1;

  if (updates.status) {
    sets.push(`status = $${paramIdx++}`);
    values.push(updates.status);
  }
  if (updates.notes !== undefined) {
    sets.push(`notes = $${paramIdx++}`);
    values.push(updates.notes);
  }

  if (sets.length === 0) return null;

  values.push(id);
  const query = `UPDATE jobs SET ${sets.join(', ')} WHERE id = $${paramIdx} RETURNING *`;
  const result = await sql.query(query, values);
  return (result.rows[0] as Job) || null;
}

export async function deleteJob(id: string): Promise<boolean> {
  const result = await sql.query('DELETE FROM jobs WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function upsertJob(
  raw: RawJob,
  match: MatchResult
): Promise<{ action: 'inserted' | 'updated' | 'skipped' }> {
  // Check if job exists
  const existing = await sql.query(
    'SELECT id, status FROM jobs WHERE external_id = $1 AND platform = $2',
    [raw.external_id, raw.platform]
  );

  if (existing.rows.length > 0) {
    // Only update jobs still in 'new' status
    if (existing.rows[0].status === 'new') {
      await sql.query(
        `UPDATE jobs SET match_score = $1, matched_skills = $2, description = $3 WHERE id = $4`,
        [match.score, match.matched_skills, raw.description?.substring(0, 5000) ?? null, existing.rows[0].id]
      );
      return { action: 'updated' };
    }
    return { action: 'skipped' };
  }

  // Insert new job
  await sql.query(
    `INSERT INTO jobs (external_id, platform, title, company, location, job_url, description, salary_range, job_type, work_mode, match_score, matched_skills, posted_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      raw.external_id,
      raw.platform,
      raw.title,
      raw.company,
      raw.location,
      raw.job_url,
      raw.description?.substring(0, 5000) ?? null,
      raw.salary_range,
      raw.job_type,
      raw.work_mode,
      match.score,
      match.matched_skills,
      raw.posted_at,
    ]
  );
  return { action: 'inserted' };
}

// ── Stats ──

export async function getStats(): Promise<StatsResponse> {
  const statsResult = await sql.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'new') as new,
      COUNT(*) FILTER (WHERE status = 'saved') as saved,
      COUNT(*) FILTER (WHERE status = 'applied') as applied,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected
    FROM jobs
  `);

  const lastRunResult = await sql.query(
    'SELECT * FROM cron_logs ORDER BY ran_at DESC LIMIT 1'
  );

  const row = statsResult.rows[0];
  return {
    stats: {
      total: parseInt(row.total, 10),
      new: parseInt(row.new, 10),
      saved: parseInt(row.saved, 10),
      applied: parseInt(row.applied, 10),
      rejected: parseInt(row.rejected, 10),
    },
    lastRun: (lastRunResult.rows[0] as CronLog) || null,
  };
}

// ── Cron logs ──

export async function logCronRun(log: Omit<CronLog, 'id' | 'ran_at'>): Promise<void> {
  await sql.query(
    `INSERT INTO cron_logs (jobs_found, jobs_new, jobs_updated, errors, duration_ms, status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [log.jobs_found, log.jobs_new, log.jobs_updated, log.errors, log.duration_ms, log.status]
  );
}

// ── Profile config ──

export async function getProfileConfig(): Promise<ProfileConfig> {
  const result = await sql.query('SELECT * FROM profile_config WHERE id = $1', ['default']);
  return result.rows[0] as ProfileConfig;
}

export async function updateProfileConfig(
  config: Omit<ProfileConfig, 'id' | 'updated_at'>
): Promise<ProfileConfig> {
  const result = await sql.query(
    `UPDATE profile_config
     SET target_roles = $1, primary_skills = $2, secondary_skills = $3,
         negative_keywords = $4, location_prefs = $5, weights = $6, min_score = $7
     WHERE id = 'default'
     RETURNING *`,
    [
      JSON.stringify(config.target_roles),
      config.primary_skills,
      config.secondary_skills,
      config.negative_keywords,
      JSON.stringify(config.location_prefs),
      JSON.stringify(config.weights),
      config.min_score,
    ]
  );
  return result.rows[0] as ProfileConfig;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/jobs/db.ts
git commit -m "feat(jobs): add database client and query functions"
```

---

### Task 4: Profile matcher

**Files:**
- Create: `src/lib/jobs/matcher.ts`

- [ ] **Step 1: Create matcher.ts**

```typescript
import type { RawJob, MatchResult, ProfileConfig } from './types';

const BONUS_KEYWORDS = ['fintech', 'mobile', 'startup', 'scale-up', 'greenfield', 'product'];

export function matchJob(job: RawJob, config: ProfileConfig): MatchResult {
  const title = job.title.toLowerCase();
  const description = (job.description || '').toLowerCase();
  const location = (job.location || '').toLowerCase();
  const combined = `${title} ${description}`;
  const matchedSkills: string[] = [];
  const w = config.weights;
  let score = 0;

  // 1. Primary skills (5 pts each, cap 40)
  let primaryPoints = 0;
  for (const skill of config.primary_skills) {
    const normalizedSkill = skill.toLowerCase();
    if (combined.includes(normalizedSkill)) {
      primaryPoints += w.primary_skill;
      matchedSkills.push(skill);
    }
  }
  score += Math.min(primaryPoints, 40);

  // 2. Role title match (20 pts for high priority exact match)
  for (const role of config.target_roles) {
    const normalizedRole = role.role.toLowerCase();
    if (title.includes(normalizedRole)) {
      score += role.priority === 'high' ? w.role_match : Math.floor(w.role_match / 2);
      break;
    }
  }

  // 3. Title keywords (3 pts each, cap 10)
  const titleKeywords = new Set<string>();
  for (const role of config.target_roles) {
    for (const word of role.role.toLowerCase().split(/\s+/)) {
      if (word.length > 3) titleKeywords.add(word);
    }
  }
  let titlePoints = 0;
  for (const keyword of titleKeywords) {
    if (title.includes(keyword)) {
      titlePoints += w.title_keyword;
    }
  }
  score += Math.min(titlePoints, 10);

  // 4. Secondary skills (2 pts each, cap 15)
  let secondaryPoints = 0;
  for (const skill of config.secondary_skills) {
    if (combined.includes(skill.toLowerCase())) {
      secondaryPoints += w.secondary_skill;
      if (!matchedSkills.includes(skill)) matchedSkills.push(skill);
    }
  }
  score += Math.min(secondaryPoints, 15);

  // 5. Location match (up to 10 pts)
  const workMode = job.work_mode?.toLowerCase() || '';
  if (workMode === 'remote' && config.location_prefs.remote) {
    score += w.location;
  } else if (workMode === 'hybrid' && config.location_prefs.hybrid_germany) {
    score += Math.floor(w.location * 0.7);
  } else if (location.includes('munich') || location.includes('münchen')) {
    if (config.location_prefs.munich_onsite) score += w.location;
  }

  // 6. Bonus keywords (2 pts each, cap 10)
  let bonusPoints = 0;
  for (const keyword of BONUS_KEYWORDS) {
    if (combined.includes(keyword)) {
      bonusPoints += w.bonus_keyword;
    }
  }
  score += Math.min(bonusPoints, 10);

  // 7. Seniority match (5 pts)
  if (/senior|lead|principal|staff|10\+\s*years/i.test(combined)) {
    score += w.seniority;
  }

  // 8. Negative keywords (-15 each)
  for (const keyword of config.negative_keywords) {
    if (combined.includes(keyword.toLowerCase())) {
      score += w.negative; // negative value
    }
  }

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  return { score, matched_skills: matchedSkills };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/jobs/matcher.ts
git commit -m "feat(jobs): add profile matching engine"
```

---

## Chunk 2: Fetcher and Cron Pipeline

### Task 5: Indeed fetcher

**Files:**
- Create: `src/lib/jobs/fetchers/indeed.ts`

- [ ] **Step 1: Create indeed.ts**

```typescript
import type { JobFetcher, RawJob, Platform } from '../types';

const JSEARCH_URL = 'https://jsearch.p.rapidapi.com/search';
const DELAY_MS = 500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseWorkMode(title: string, description: string): 'remote' | 'hybrid' | 'onsite' | null {
  const combined = `${title} ${description}`.toLowerCase();
  if (combined.includes('remote')) return 'remote';
  if (combined.includes('hybrid')) return 'hybrid';
  if (combined.includes('onsite') || combined.includes('on-site') || combined.includes('on site')) return 'onsite';
  return null;
}

function parseJobType(type: string | undefined): 'full-time' | 'part-time' | 'contract' | null {
  if (!type) return null;
  const t = type.toLowerCase();
  if (t.includes('full')) return 'full-time';
  if (t.includes('part')) return 'part-time';
  if (t.includes('contract') || t.includes('freelance')) return 'contract';
  return null;
}

export const indeedFetcher: JobFetcher = {
  platform: 'indeed' as Platform,
  enabled: !!process.env.RAPIDAPI_KEY,

  async fetch(queries: string[]): Promise<RawJob[]> {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) return [];

    const jobs: RawJob[] = [];

    for (let i = 0; i < queries.length; i++) {
      if (i > 0) await delay(DELAY_MS);

      try {
        const params = new URLSearchParams({
          query: queries[i],
          page: '1',
          num_pages: '1',
          country: 'de',
          date_posted: 'week',
        });

        const response = await fetch(`${JSEARCH_URL}?${params}`, {
          headers: {
            'x-rapidapi-host': 'jsearch.p.rapidapi.com',
            'x-rapidapi-key': apiKey,
          },
        });

        if (!response.ok) {
          console.error(`JSearch error for "${queries[i]}": ${response.status}`);
          continue;
        }

        const data = await response.json();
        const results = data.data || [];

        for (const item of results) {
          jobs.push({
            external_id: item.job_id || `indeed-${Date.now()}-${Math.random()}`,
            platform: 'indeed',
            title: item.job_title || 'Untitled',
            company: item.employer_name || 'Unknown',
            location: [item.job_city, item.job_state, item.job_country]
              .filter(Boolean)
              .join(', ') || null,
            job_url: item.job_apply_link || item.job_google_link || '',
            description: item.job_description?.substring(0, 5000) || null,
            salary_range: item.job_min_salary && item.job_max_salary
              ? `${item.job_min_salary}-${item.job_max_salary} ${item.job_salary_currency || 'EUR'}/${item.job_salary_period || 'year'}`
              : null,
            job_type: parseJobType(item.job_employment_type),
            work_mode: parseWorkMode(item.job_title || '', item.job_description || ''),
            posted_at: item.job_posted_at_datetime_utc || null,
          });
        }
      } catch (error) {
        console.error(`JSearch fetch error for "${queries[i]}":`, error);
      }
    }

    return jobs;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/jobs/fetchers/indeed.ts
git commit -m "feat(jobs): add Indeed fetcher via JSearch API"
```

---

### Task 6: Fetcher aggregator

**Files:**
- Create: `src/lib/jobs/fetchers/index.ts`

- [ ] **Step 1: Create aggregator**

```typescript
import type { RawJob, ProfileConfig, CronResult } from '../types';
import { matchJob } from '../matcher';
import { upsertJob, logCronRun, getProfileConfig } from '../db';
import { indeedFetcher } from './indeed';

// Register all fetchers here. Add new fetchers to this array.
const fetchers = [indeedFetcher];

function buildQueries(config: ProfileConfig): string[] {
  // Build up to 4 queries from high-priority roles, then medium
  const queries: string[] = [];
  const highPriority = config.target_roles.filter((r) => r.priority === 'high');
  const medPriority = config.target_roles.filter((r) => r.priority === 'medium');

  for (const role of [...highPriority, ...medPriority]) {
    if (queries.length >= 4) break;
    queries.push(`${role.role} Munich Germany`);
  }

  return queries;
}

function dedup(jobs: RawJob[]): RawJob[] {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const key = `${job.platform}:${job.external_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function runFetchPipeline(): Promise<CronResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let totalFetched = 0;
  let totalMatched = 0;
  let newJobs = 0;
  let updatedJobs = 0;

  try {
    const config = await getProfileConfig();
    const queries = buildQueries(config);
    const enabledFetchers = fetchers.filter((f) => f.enabled);

    if (enabledFetchers.length === 0) {
      errors.push('No fetchers enabled. Check API keys.');
    }

    // Fetch from all enabled sources in parallel
    const fetchResults = await Promise.allSettled(
      enabledFetchers.map((f) => f.fetch(queries))
    );

    const allJobs: RawJob[] = [];
    fetchResults.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        allJobs.push(...result.value);
      } else {
        errors.push(`${enabledFetchers[i].platform}: ${result.reason}`);
      }
    });

    totalFetched = allJobs.length;

    // Dedup
    const uniqueJobs = dedup(allJobs);

    // Match and score
    for (const job of uniqueJobs) {
      const match = matchJob(job, config);
      if (match.score < config.min_score) continue;

      totalMatched++;
      const result = await upsertJob(job, match);
      if (result.action === 'inserted') newJobs++;
      if (result.action === 'updated') updatedJobs++;
    }
  } catch (error) {
    errors.push(`Pipeline error: ${error instanceof Error ? error.message : String(error)}`);
  }

  const durationMs = Date.now() - startTime;
  const status = errors.length === 0 ? 'success' : totalFetched > 0 ? 'partial' : 'failed';

  await logCronRun({
    jobs_found: totalFetched,
    jobs_new: newJobs,
    jobs_updated: updatedJobs,
    errors,
    duration_ms: durationMs,
    status,
  });

  return {
    success: status !== 'failed',
    stats: {
      fetched: totalFetched,
      matched: totalMatched,
      new_jobs: newJobs,
      updated: updatedJobs,
    },
    errors,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/jobs/fetchers/index.ts
git commit -m "feat(jobs): add fetcher aggregator with dedup and scoring pipeline"
```

---

## Chunk 3: API Routes

### Task 7: Jobs CRUD API

**Files:**
- Create: `src/app/api/jobs/route.ts`

- [ ] **Step 1: Create jobs CRUD route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listJobs, updateJob, deleteJob } from '@/lib/jobs/db';
import type { JobStatus } from '@/lib/jobs/types';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return !!token?.value;
}

export async function GET(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const result = await listJobs({
    status: searchParams.get('status') || undefined,
    platform: searchParams.get('platform') || undefined,
    search: searchParams.get('search') || undefined,
    sort: searchParams.get('sort') || undefined,
    order: (searchParams.get('order') as 'asc' | 'desc') || undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined,
  });

  return NextResponse.json(result);
}

export async function PATCH(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status, notes } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing job id' }, { status: 400 });
    }

    const job = await updateJob(id, {
      status: status as JobStatus | undefined,
      notes,
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing job id' }, { status: 400 });
  }

  const deleted = await deleteJob(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/jobs/route.ts
git commit -m "feat(jobs): add jobs CRUD API route"
```

---

### Task 8: Stats, Config, and Cron API routes

**Files:**
- Create: `src/app/api/jobs/stats/route.ts`
- Create: `src/app/api/jobs/config/route.ts`
- Create: `src/app/api/jobs/cron/route.ts`

- [ ] **Step 1: Create stats route**

```typescript
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStats } from '@/lib/jobs/db';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  if (!token?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await getStats();
  return NextResponse.json(data);
}
```

- [ ] **Step 2: Create config route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getProfileConfig, updateProfileConfig } from '@/lib/jobs/db';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return !!token?.value;
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = await getProfileConfig();
  return NextResponse.json({ config });
}

export async function PUT(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const config = await updateProfileConfig(body);
    return NextResponse.json({ config });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
```

- [ ] **Step 3: Create cron route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { runFetchPipeline } from '@/lib/jobs/fetchers';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify CRON_SECRET
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runFetchPipeline();
  return NextResponse.json(result);
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/jobs/stats/route.ts src/app/api/jobs/config/route.ts src/app/api/jobs/cron/route.ts
git commit -m "feat(jobs): add stats, config, and cron API routes"
```

---

## Chunk 4: Dashboard UI

### Task 9: Jobs page layout, entry point, login screen, and server actions

**Files:**
- Create: `src/app/jobs/layout.tsx`
- Create: `src/app/jobs/page.tsx`
- Create: `src/app/jobs/components/LoginScreen.tsx`
- Create: `src/app/jobs/actions.ts`

- [ ] **Step 1: Create layout.tsx (noindex metadata)**

The root layout already provides `<html>` and `<body>`. This layout only adds metadata.

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Scheduler | Anil Khanna',
  robots: { index: false, follow: false },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 2: Create page.tsx (auth gate)**

```tsx
import { cookies } from 'next/headers';
import { LoginScreen } from './components/LoginScreen';
import { JobsDashboard } from './components/JobsDashboard';

export default async function JobsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  const isAuthenticated = !!token?.value;

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <JobsDashboard />;
}
```

- [ ] **Step 3: Create LoginScreen component**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginScreen() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        setError(true);
        setPassword('');
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#ccd6f6] text-center mb-2">Job Scheduler</h1>
        <p className="text-sm text-[#8892b0] text-center mb-8">Enter password to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`w-full bg-[#112240] border rounded-md px-4 py-3 text-[#ccd6f6] placeholder-[#4a5568] focus:outline-none focus:border-[#64ffda] ${
              error ? 'border-red-500 animate-[shake_0.3s_ease-in-out]' : 'border-[#1d2d50]'
            }`}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-md bg-[#64ffda] text-[#0a0a0a] font-medium hover:bg-[#64ffda]/90 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <a href="/" className="block text-center text-sm text-[#8892b0] hover:text-[#64ffda] mt-6">
          ← Back to Portfolio
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create actions.ts (server actions)**

```typescript
'use server';

import { cookies } from 'next/headers';
import { runFetchPipeline } from '@/lib/jobs/fetchers';
import type { CronResult } from '@/lib/jobs/types';

export async function triggerFetchNow(): Promise<CronResult> {
  return await runFetchPipeline();
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/jobs/layout.tsx src/app/jobs/page.tsx src/app/jobs/actions.ts src/app/jobs/components/LoginScreen.tsx
git commit -m "feat(jobs): add jobs page layout, auth gate, login screen, and server actions"
```

---

### Task 10: StatsBar component

**Files:**
- Create: `src/app/jobs/components/StatsBar.tsx`

- [ ] **Step 1: Create StatsBar**

```tsx
'use client';

interface StatsBarProps {
  stats: {
    total: number;
    new: number;
    saved: number;
    applied: number;
    rejected: number;
  };
}

const statCards = [
  { key: 'total', label: 'Total', color: 'text-[#ccd6f6]', bg: 'bg-[#ccd6f6]/10' },
  { key: 'new', label: 'New', color: 'text-[#64ffda]', bg: 'bg-[#64ffda]/10' },
  { key: 'saved', label: 'Saved', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { key: 'applied', label: 'Applied', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { key: 'rejected', label: 'Rejected', color: 'text-[#4a5568]', bg: 'bg-[#4a5568]/10' },
] as const;

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {statCards.map(({ key, label, color, bg }) => (
        <div
          key={key}
          className={`${bg} rounded-lg p-3 text-center border border-[#1d2d50]`}
        >
          <div className={`text-2xl font-bold ${color}`}>
            {stats[key as keyof typeof stats]}
          </div>
          <div className="text-xs text-[#8892b0] mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/jobs/components/StatsBar.tsx
git commit -m "feat(jobs): add StatsBar component"
```

---

### Task 11: FilterBar component

**Files:**
- Create: `src/app/jobs/components/FilterBar.tsx`

- [ ] **Step 1: Create FilterBar**

```tsx
'use client';

interface FilterBarProps {
  search: string;
  status: string;
  sort: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

const statusOptions = ['all', 'new', 'reviewed', 'saved', 'applied', 'rejected'];
const sortOptions = [
  { value: 'match_score', label: 'Match Score' },
  { value: 'newest', label: 'Newest' },
  { value: 'company', label: 'Company' },
  { value: 'title', label: 'Title' },
];

const selectClass =
  'bg-[#112240] border border-[#1d2d50] rounded-md px-3 py-2 text-sm text-[#ccd6f6] focus:outline-none focus:border-[#64ffda] appearance-none';

export function FilterBar({
  search,
  status,
  sort,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        type="text"
        placeholder="Search jobs..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 min-w-[200px] bg-[#112240] border border-[#1d2d50] rounded-md px-3 py-2 text-sm text-[#ccd6f6] placeholder-[#4a5568] focus:outline-none focus:border-[#64ffda]"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className={selectClass}
      >
        {statusOptions.map((s) => (
          <option key={s} value={s}>
            {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className={selectClass}
      >
        {sortOptions.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/jobs/components/FilterBar.tsx
git commit -m "feat(jobs): add FilterBar component"
```

---

### Task 12: JobCard component

**Files:**
- Create: `src/app/jobs/components/JobCard.tsx`

- [ ] **Step 1: Create JobCard**

```tsx
'use client';

import { useState } from 'react';
import type { Job, JobStatus } from '@/lib/jobs/types';

interface JobCardProps {
  job: Job;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: JobStatus) => void;
  onNotesChange: (id: string, notes: string) => void;
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-[#64ffda] bg-[#64ffda]/10 border-[#64ffda]/30';
  if (score >= 50) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
  if (score >= 30) return 'text-[#8892b0] bg-[#8892b0]/10 border-[#8892b0]/30';
  return 'text-[#4a5568] bg-[#4a5568]/10 border-[#4a5568]/30';
}

function scoreLabel(score: number): string {
  if (score >= 70) return 'Strong match';
  if (score >= 50) return 'Good match';
  if (score >= 30) return 'Partial match';
  return 'Weak match';
}

function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    new: 'text-[#64ffda] bg-[#64ffda]/10',
    reviewed: 'text-[#8892b0] bg-[#8892b0]/10',
    saved: 'text-yellow-400 bg-yellow-400/10',
    applied: 'text-blue-400 bg-blue-400/10',
    rejected: 'text-[#4a5568] bg-[#4a5568]/10',
    expired: 'text-[#4a5568] bg-[#4a5568]/10',
  };
  return map[status] || '';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const statusFlow: JobStatus[] = ['new', 'reviewed', 'saved', 'applied'];

export function JobCard({ job, isExpanded, onToggle, onStatusChange, onNotesChange }: JobCardProps) {
  const [notes, setNotes] = useState(job.notes || '');

  function handleNotesBlur() {
    if (notes !== (job.notes || '')) {
      onNotesChange(job.id, notes);
    }
  }

  function handleQuickAction(e: React.MouseEvent, status: JobStatus) {
    e.stopPropagation();
    onStatusChange(job.id, status);
  }

  return (
    <div className={`border rounded-lg transition-colors ${isExpanded ? 'border-[#64ffda]/40 bg-[#0a0f1c]' : 'border-[#1d2d50] bg-[#0a0f1c] hover:border-[#233554]'}`}>
      {/* Collapsed header — always visible */}
      <div className="flex items-center gap-3 p-4 cursor-pointer group" onClick={onToggle}>
        {/* Score badge */}
        <div className={`shrink-0 w-12 h-12 rounded-lg border flex flex-col items-center justify-center text-xs font-bold ${scoreColor(job.match_score)}`}>
          {Math.round(job.match_score)}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[#ccd6f6] font-medium truncate">{job.title}</h3>
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${statusBadgeClass(job.status)}`}>
              {job.status}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-[#8892b0]">
            <span>{job.company}</span>
            {job.location && <><span>·</span><span>{job.location}</span></>}
            {job.work_mode && <><span>·</span><span className="capitalize">{job.work_mode}</span></>}
          </div>
        </div>

        {/* Right side */}
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs text-[#4a5568]">{timeAgo(job.discovered_at)}</span>
          {/* Quick actions on hover */}
          <div className="hidden group-hover:flex gap-1">
            {job.status !== 'saved' && (
              <button
                onClick={(e) => handleQuickAction(e, 'saved')}
                className="text-xs px-2 py-1 rounded bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20"
              >
                Save
              </button>
            )}
            {job.status !== 'rejected' && (
              <button
                onClick={(e) => handleQuickAction(e, 'rejected')}
                className="text-xs px-2 py-1 rounded bg-[#4a5568]/10 text-[#4a5568] hover:bg-[#4a5568]/20"
              >
                Reject
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-[#1d2d50] p-4 space-y-4">
          {/* Match score bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={scoreColor(job.match_score).split(' ')[0]}>{scoreLabel(job.match_score)}</span>
              <span className="text-[#8892b0]">{Math.round(job.match_score)}%</span>
            </div>
            <div className="h-1.5 bg-[#112240] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${job.match_score >= 70 ? 'bg-[#64ffda]' : job.match_score >= 50 ? 'bg-yellow-400' : 'bg-[#8892b0]'}`}
                style={{ width: `${job.match_score}%` }}
              />
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-2 text-xs text-[#8892b0]">
            {job.job_type && <span className="px-2 py-1 rounded bg-[#112240]">{job.job_type}</span>}
            {job.salary_range && <span className="px-2 py-1 rounded bg-[#112240]">{job.salary_range}</span>}
            <span className="px-2 py-1 rounded bg-[#2164f3]/10 text-[#2164f3]">
              Indeed
            </span>
          </div>

          {/* Matched skills */}
          {job.matched_skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.matched_skills.map((skill) => (
                <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-[#64ffda]/10 text-[#64ffda]">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Status action buttons */}
          <div className="flex gap-2">
            {statusFlow.map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(job.id, s)}
                className={`text-xs px-3 py-1.5 rounded transition-colors ${
                  job.status === s
                    ? 'bg-[#64ffda] text-[#0a0a0a] font-medium'
                    : 'bg-[#112240] text-[#8892b0] hover:text-[#ccd6f6]'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <button
              onClick={() => onStatusChange(job.id, 'rejected')}
              className={`text-xs px-3 py-1.5 rounded transition-colors ${
                job.status === 'rejected'
                  ? 'bg-red-500/20 text-red-400 font-medium'
                  : 'bg-[#112240] text-[#8892b0] hover:text-red-400'
              }`}
            >
              Rejected
            </button>
          </div>

          {/* Open job posting */}
          {job.job_url && (
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-[#64ffda] hover:underline"
            >
              Open Job Posting →
            </a>
          )}

          {/* Notes */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add notes..."
            rows={2}
            className="w-full bg-[#112240] border border-[#1d2d50] rounded-md px-3 py-2 text-sm text-[#ccd6f6] placeholder-[#4a5568] focus:outline-none focus:border-[#64ffda] resize-none"
          />

          {/* Description */}
          {job.description && (
            <div className="max-h-60 overflow-y-auto text-sm text-[#8892b0] leading-relaxed whitespace-pre-wrap border-t border-[#1d2d50] pt-4">
              {job.description}
            </div>
          )}

          {/* Footer */}
          <div className="text-xs text-[#4a5568] flex justify-between">
            <span>Discovered {timeAgo(job.discovered_at)}</span>
            <span className="capitalize">{job.platform}</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/jobs/components/JobCard.tsx
git commit -m "feat(jobs): add expandable JobCard component"
```

---

### Task 13: SettingsPanel component

**Files:**
- Create: `src/app/jobs/components/SettingsPanel.tsx`

- [ ] **Step 1: Create SettingsPanel**

```tsx
'use client';

import { useState, useEffect } from 'react';
import type { ProfileConfig, TargetRole, RolePriority } from '@/lib/jobs/types';

interface SettingsPanelProps {
  onClose: () => void;
}

const inputClass =
  'w-full bg-[#112240] border border-[#1d2d50] rounded-md px-3 py-2 text-sm text-[#ccd6f6] placeholder-[#4a5568] focus:outline-none focus:border-[#64ffda]';

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [config, setConfig] = useState<ProfileConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/jobs/config')
      .then((r) => r.json())
      .then((data) => setConfig(data.config))
      .catch(() => setError('Failed to load config'));
  }, []);

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/jobs/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_roles: config.target_roles,
          primary_skills: config.primary_skills,
          secondary_skills: config.secondary_skills,
          negative_keywords: config.negative_keywords,
          location_prefs: config.location_prefs,
          weights: config.weights,
          min_score: config.min_score,
        }),
      });

      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      setConfig(data.config);
    } catch {
      setError('Failed to save config');
    } finally {
      setSaving(false);
    }
  }

  function updateSkillsList(field: 'primary_skills' | 'secondary_skills' | 'negative_keywords', value: string) {
    if (!config) return;
    setConfig({
      ...config,
      [field]: value.split(',').map((s) => s.trim()).filter(Boolean),
    });
  }

  function updateRole(index: number, key: keyof TargetRole, value: string) {
    if (!config) return;
    const roles = [...config.target_roles];
    roles[index] = { ...roles[index], [key]: value };
    setConfig({ ...config, target_roles: roles });
  }

  function addRole() {
    if (!config) return;
    setConfig({
      ...config,
      target_roles: [...config.target_roles, { role: '', priority: 'medium' as RolePriority }],
    });
  }

  function removeRole(index: number) {
    if (!config) return;
    setConfig({
      ...config,
      target_roles: config.target_roles.filter((_, i) => i !== index),
    });
  }

  if (!config) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-[#0a0f1c] border border-[#1d2d50] rounded-lg p-6 text-[#8892b0]">
          {error || 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0f1c] border border-[#1d2d50] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0a0f1c] border-b border-[#1d2d50] p-4 flex justify-between items-center">
          <h2 className="text-lg font-medium text-[#ccd6f6]">Profile Settings</h2>
          <button onClick={onClose} className="text-[#8892b0] hover:text-[#ccd6f6]">✕</button>
        </div>

        <div className="p-4 space-y-6">
          {/* Target Roles */}
          <div>
            <label className="block text-sm text-[#8892b0] mb-2">Target Roles</label>
            {config.target_roles.map((role, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  className={`${inputClass} flex-1`}
                  value={role.role}
                  onChange={(e) => updateRole(i, 'role', e.target.value)}
                  placeholder="Role title"
                />
                <select
                  className={inputClass + ' w-28'}
                  value={role.priority}
                  onChange={(e) => updateRole(i, 'priority', e.target.value)}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button onClick={() => removeRole(i)} className="text-red-400 hover:text-red-300 px-2">✕</button>
              </div>
            ))}
            <button onClick={addRole} className="text-xs text-[#64ffda] hover:underline">+ Add Role</button>
          </div>

          {/* Primary Skills */}
          <div>
            <label className="block text-sm text-[#8892b0] mb-2">Primary Skills (comma-separated)</label>
            <input
              className={inputClass}
              value={config.primary_skills.join(', ')}
              onChange={(e) => updateSkillsList('primary_skills', e.target.value)}
            />
          </div>

          {/* Secondary Skills */}
          <div>
            <label className="block text-sm text-[#8892b0] mb-2">Secondary Skills (comma-separated)</label>
            <input
              className={inputClass}
              value={config.secondary_skills.join(', ')}
              onChange={(e) => updateSkillsList('secondary_skills', e.target.value)}
            />
          </div>

          {/* Negative Keywords */}
          <div>
            <label className="block text-sm text-[#8892b0] mb-2">Negative Keywords (comma-separated)</label>
            <input
              className={inputClass}
              value={config.negative_keywords.join(', ')}
              onChange={(e) => updateSkillsList('negative_keywords', e.target.value)}
            />
          </div>

          {/* Location Preferences */}
          <div>
            <label className="block text-sm text-[#8892b0] mb-2">Location Preferences</label>
            <div className="space-y-2">
              {(['munich_onsite', 'hybrid_germany', 'remote'] as const).map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm text-[#ccd6f6]">
                  <input
                    type="checkbox"
                    checked={config.location_prefs[key]}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        location_prefs: { ...config.location_prefs, [key]: e.target.checked },
                      })
                    }
                    className="accent-[#64ffda]"
                  />
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </label>
              ))}
            </div>
          </div>

          {/* Scoring Weights */}
          <div>
            <label className="block text-sm text-[#8892b0] mb-2">Scoring Weights</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(config.weights) as [string, number][]).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <label className="text-xs text-[#8892b0] flex-1">{key.replace(/_/g, ' ')}</label>
                  <input
                    type="number"
                    className={inputClass + ' w-20 text-right'}
                    value={value}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        weights: { ...config.weights, [key]: parseInt(e.target.value, 10) || 0 },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Min Score */}
          <div>
            <label className="block text-sm text-[#8892b0] mb-2">Minimum Score Threshold</label>
            <input
              type="number"
              className={inputClass + ' w-24'}
              value={config.min_score}
              onChange={(e) => setConfig({ ...config, min_score: parseInt(e.target.value, 10) || 0 })}
              min={0}
              max={100}
            />
          </div>

          {/* Error */}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2 rounded-md bg-[#64ffda] text-[#0a0a0a] font-medium hover:bg-[#64ffda]/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/jobs/components/SettingsPanel.tsx
git commit -m "feat(jobs): add SettingsPanel component for profile config"
```

---

### Task 14: JobsDashboard (main orchestrator)

**Files:**
- Create: `src/app/jobs/components/JobsDashboard.tsx`

- [ ] **Step 1: Create JobsDashboard**

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Job, JobStatus, StatsResponse } from '@/lib/jobs/types';
import { StatsBar } from './StatsBar';
import { FilterBar } from './FilterBar';
import { JobCard } from './JobCard';
import { SettingsPanel } from './SettingsPanel';
import { triggerFetchNow, logout as logoutAction } from '../actions';

export function JobsDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('match_score');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = useCallback(async () => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (search) params.set('search', search);
    params.set('sort', sort);
    params.set('page', String(page));
    params.set('limit', '20');

    try {
      const res = await fetch(`/api/jobs?${params}`);
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      // ignore
    }
  }, [status, search, sort, page, router]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchJobs(), fetchStats()]).then(() => setLoading(false));
  }, [fetchJobs, fetchStats]);

  // Debounce search
  const [searchDebounce, setSearchDebounce] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchDebounce), 300);
    return () => clearTimeout(timer);
  }, [searchDebounce]);

  async function handleFetchNow() {
    setFetching(true);
    await triggerFetchNow();
    await Promise.all([fetchJobs(), fetchStats()]);
    setFetching(false);
  }

  async function handleStatusChange(id: string, newStatus: JobStatus) {
    await fetch('/api/jobs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    await Promise.all([fetchJobs(), fetchStats()]);
  }

  async function handleNotesChange(id: string, notes: string) {
    await fetch('/api/jobs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, notes }),
    });
  }

  async function handleLogout() {
    await logoutAction();
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-[#8892b0]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1d2d50]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="text-[#8892b0] hover:text-[#64ffda] text-sm">←</a>
          <h1 className="text-lg font-medium text-[#ccd6f6] flex-1">Job Scheduler</h1>

          <button
            onClick={handleFetchNow}
            disabled={fetching}
            className="text-xs px-3 py-1.5 rounded bg-[#64ffda]/10 text-[#64ffda] hover:bg-[#64ffda]/20 disabled:opacity-50"
          >
            {fetching ? 'Fetching...' : 'Fetch Now'}
          </button>

          {stats?.lastRun && (
            <span className="text-xs text-[#4a5568] hidden sm:inline">
              Last run: {new Date(stats.lastRun.ran_at).toLocaleString()}
            </span>
          )}

          <button
            onClick={() => setShowSettings(true)}
            className="text-[#8892b0] hover:text-[#ccd6f6] text-sm"
            title="Settings"
          >
            ⚙
          </button>

          <button
            onClick={handleLogout}
            className="text-xs text-[#8892b0] hover:text-red-400"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {stats && <StatsBar stats={stats.stats} />}

        <FilterBar
          search={searchDebounce}
          status={status}
          sort={sort}
          onSearchChange={setSearchDebounce}
          onStatusChange={(v) => { setStatus(v); setPage(1); }}
          onSortChange={(v) => { setSort(v); setPage(1); }}
        />

        {/* Job list */}
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="text-center py-12 text-[#8892b0]">
              {search || status !== 'all' ? 'No jobs match your filters.' : 'No jobs yet. Click "Fetch Now" to get started.'}
            </div>
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isExpanded={expandedId === job.id}
                onToggle={() => setExpandedId(expandedId === job.id ? null : job.id)}
                onStatusChange={handleStatusChange}
                onNotesChange={handleNotesChange}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded text-sm ${
                  p === page
                    ? 'bg-[#64ffda] text-[#0a0a0a] font-medium'
                    : 'bg-[#112240] text-[#8892b0] hover:text-[#ccd6f6]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Settings modal */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/jobs/components/JobsDashboard.tsx
git commit -m "feat(jobs): add JobsDashboard orchestrator"
```

---

## Chunk 5: Integration and Polish

### Task 15: Update globals.css with shake animation

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add shake keyframe to globals.css**

Append to the end of `src/app/globals.css`:

```css
/* Shake animation for login error */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(jobs): add shake animation for login error"
```

---

### Task 16: Verify build compiles

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: No errors (warnings acceptable)

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds. The jobs routes compile. Some dynamic route warnings are acceptable.

- [ ] **Step 3: Fix any build errors and commit**

If errors found, fix them and commit:

```bash
git add -A
git commit -m "fix(jobs): resolve build errors"
```

---

### Task 17: Manual smoke test

- [ ] **Step 1: Add env variables to `.env.local`**

Add `POSTGRES_URL`, `CRON_SECRET`, and `RAPIDAPI_KEY` to `.env.local`. Generate CRON_SECRET with:

Run: `openssl rand -hex 32`

- [ ] **Step 2: Run the database schema**

Execute `schema.sql` against your Vercel Postgres instance (via Vercel dashboard SQL editor or `psql`).

- [ ] **Step 3: Start dev server and test**

Run: `npm run dev`

Test flow:
1. Visit `http://localhost:3000/jobs` → should see login screen
2. Enter admin password → should see empty dashboard
3. Click "Fetch Now" → should fetch jobs from Indeed (if RAPIDAPI_KEY is set)
4. Verify stats update, job cards appear
5. Expand a job card → verify details, status buttons, notes
6. Click settings → verify config loads, edit and save
7. Filter by status and search → verify filtering works
8. Test logout → should return to login

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(jobs): smoke test fixes"
```
