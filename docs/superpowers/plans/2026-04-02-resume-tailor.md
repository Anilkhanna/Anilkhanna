# Resume Tailor System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an in-app system that takes a job description, analyzes it with Claude CLI, lets the user pick/exclude skills, generates a tailored ATS resume, and saves the history to MySQL.

**Architecture:** MySQL replaces PostgreSQL for all database needs. Claude CLI spawned as a child process for JD analysis. Admin panel gets a new "Tailor Resume" section with skill picker, preview, and history. Tailored resumes viewable/printable at `/resume/tailored/[id]`.

**Tech Stack:** Next.js 16, mysql2, Claude CLI (`claude -p --output-format json`), React (admin panel), Tailwind CSS

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/lib/db.ts` | **NEW** — MySQL connection pool (mysql2/promise), shared by jobs + resume tailor |
| `src/lib/claude.ts` | **NEW** — Claude CLI child process wrapper, spawns `claude -p`, parses JSON response |
| `src/lib/db/schema.sql` | **NEW** — All MySQL table definitions (jobs + cron_logs + profile_config + tailored_resumes) |
| `src/lib/jobs/db.ts` | **MODIFY** — Replace pg import with mysql2 pool from `src/lib/db.ts`, convert all queries |
| `src/app/api/resume/tailor/route.ts` | **NEW** — POST endpoint: receives JD, calls Claude CLI, returns analysis |
| `src/app/api/resume/tailor/save/route.ts` | **NEW** — POST endpoint: saves tailored resume to MySQL |
| `src/app/api/resume/tailor/[id]/route.ts` | **NEW** — GET/DELETE endpoint: fetch or remove saved tailored resume |
| `src/app/api/resume/tailor/history/route.ts` | **NEW** — GET endpoint: list all tailored resumes |
| `src/app/resume/tailored/[id]/page.tsx` | **NEW** — Server component: renders tailored resume for print/view |
| `src/app/admin-panel-9x7k/page.tsx` | **MODIFY** — Add TailorResumeEditor section with skill picker, preview, history |
| `package.json` | **MODIFY** — Remove `pg` + `@types/pg`, add `mysql2` |

---

### Task 1: Replace pg with mysql2

**Files:**
- Modify: `package.json`
- Create: `src/lib/db.ts`
- Modify: `src/lib/jobs/db.ts`

- [ ] **Step 1: Uninstall pg, install mysql2**

```bash
npm uninstall pg @types/pg && npm install mysql2
```

- [ ] **Step 2: Create MySQL connection pool**

Create `src/lib/db.ts`:

```typescript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
```

- [ ] **Step 3: Rewrite jobs/db.ts — imports and sql helper**

Replace the top of `src/lib/jobs/db.ts` (lines 1-8) with:

```typescript
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type {
  Job, JobStatus, ProfileConfig, CronLog,
  JobsListResponse, StatsResponse, RawJob, MatchResult,
} from './types';
```

- [ ] **Step 4: Rewrite listJobs function**

Replace the `listJobs` function in `src/lib/jobs/db.ts` with:

```typescript
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

  if (status && status !== 'all') {
    conditions.push('status = ?');
    values.push(status);
  }
  if (platform && platform !== 'all') {
    conditions.push('platform = ?');
    values.push(platform);
  }
  if (search) {
    conditions.push('(title LIKE ? OR company LIKE ? OR description LIKE ?)');
    const searchVal = `%${search}%`;
    values.push(searchVal, searchVal, searchVal);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sortColumns: Record<string, string> = {
    match_score: 'match_score',
    newest: 'discovered_at',
    company: 'company',
    title: 'title',
  };
  const sortCol = sortColumns[sort] || 'match_score';
  const sortDir = order === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM jobs ${where}`, values
  );
  const total = countRows[0].count as number;

  const [dataRows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM jobs ${where} ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  return {
    jobs: dataRows as unknown as Job[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
```

- [ ] **Step 5: Rewrite updateJob function**

Replace `updateJob` in `src/lib/jobs/db.ts`:

```typescript
export async function updateJob(
  id: string,
  updates: { status?: JobStatus; notes?: string }
): Promise<Job | null> {
  const sets: string[] = [];
  const values: string[] = [];

  if (updates.status !== undefined) {
    sets.push('status = ?');
    values.push(updates.status);
  }
  if (updates.notes !== undefined) {
    sets.push('notes = ?');
    values.push(updates.notes);
  }

  if (sets.length === 0) return null;

  values.push(id);
  await pool.query(`UPDATE jobs SET ${sets.join(', ')} WHERE id = ?`, values);

  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM jobs WHERE id = ?', [id]);
  return (rows[0] as unknown as Job) || null;
}
```

- [ ] **Step 6: Rewrite deleteJob function**

Replace `deleteJob` in `src/lib/jobs/db.ts`:

```typescript
export async function deleteJob(id: string): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM jobs WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
```

- [ ] **Step 7: Rewrite upsertJob function**

Replace `upsertJob` in `src/lib/jobs/db.ts`:

```typescript
export async function upsertJob(
  raw: RawJob,
  match: MatchResult
): Promise<{ action: 'inserted' | 'updated' | 'skipped' }> {
  const [existing] = await pool.query<RowDataPacket[]>(
    'SELECT id, status FROM jobs WHERE external_id = ? AND platform = ?',
    [raw.external_id, raw.platform]
  );

  if (existing.length > 0) {
    if (existing[0].status === 'new') {
      await pool.query(
        'UPDATE jobs SET match_score = ?, matched_skills = ?, description = ? WHERE id = ?',
        [match.score, JSON.stringify(match.matched_skills), raw.description?.substring(0, 5000) ?? null, existing[0].id]
      );
      return { action: 'updated' };
    }
    return { action: 'skipped' };
  }

  await pool.query(
    `INSERT INTO jobs (external_id, platform, title, company, location, job_url, description, salary_range, job_type, work_mode, match_score, matched_skills, posted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      JSON.stringify(match.matched_skills),
      raw.posted_at,
    ]
  );
  return { action: 'inserted' };
}
```

- [ ] **Step 8: Rewrite getStats function**

Replace `getStats` in `src/lib/jobs/db.ts`:

```typescript
export async function getStats(): Promise<StatsResponse> {
  const [statsRows] = await pool.query<RowDataPacket[]>(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
      SUM(CASE WHEN status = 'saved' THEN 1 ELSE 0 END) as saved,
      SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END) as applied,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM jobs
  `);

  const [lastRunRows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM cron_logs ORDER BY ran_at DESC LIMIT 1'
  );

  const row = statsRows[0];
  return {
    stats: {
      total: Number(row.total),
      new: Number(row.new_count),
      saved: Number(row.saved),
      applied: Number(row.applied),
      rejected: Number(row.rejected),
    },
    lastRun: (lastRunRows[0] as unknown as CronLog) || null,
  };
}
```

- [ ] **Step 9: Rewrite logCronRun function**

Replace `logCronRun` in `src/lib/jobs/db.ts`:

```typescript
export async function logCronRun(log: Omit<CronLog, 'id' | 'ran_at'>): Promise<void> {
  await pool.query(
    `INSERT INTO cron_logs (jobs_found, jobs_new, jobs_updated, errors, duration_ms, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [log.jobs_found, log.jobs_new, log.jobs_updated, JSON.stringify(log.errors), log.duration_ms, log.status]
  );
}
```

- [ ] **Step 10: Rewrite getProfileConfig and updateProfileConfig**

Replace both functions in `src/lib/jobs/db.ts`:

```typescript
export async function getProfileConfig(): Promise<ProfileConfig> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM profile_config WHERE id = ?', ['default']);
  return rows[0] as unknown as ProfileConfig;
}

export async function updateProfileConfig(
  config: Omit<ProfileConfig, 'id' | 'updated_at'>
): Promise<ProfileConfig> {
  await pool.query(
    `UPDATE profile_config
     SET target_roles = ?, primary_skills = ?, secondary_skills = ?,
         negative_keywords = ?, location_prefs = ?, weights = ?, min_score = ?
     WHERE id = 'default'`,
    [
      JSON.stringify(config.target_roles),
      JSON.stringify(config.primary_skills),
      JSON.stringify(config.secondary_skills),
      JSON.stringify(config.negative_keywords),
      JSON.stringify(config.location_prefs),
      JSON.stringify(config.weights),
      config.min_score,
    ]
  );

  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM profile_config WHERE id = ?', ['default']);
  return rows[0] as unknown as ProfileConfig;
}
```

- [ ] **Step 11: Verify build passes**

```bash
NEXT_DISABLE_TURBOPACK=1 npx next build
```

Expected: Build succeeds with no pg-related errors.

- [ ] **Step 12: Commit**

```bash
git add package.json package-lock.json src/lib/db.ts src/lib/jobs/db.ts
git commit -m "refactor: replace PostgreSQL with MySQL (mysql2)"
```

---

### Task 2: Create MySQL schema file

**Files:**
- Create: `src/lib/db/schema.sql`

- [ ] **Step 1: Create schema file with all tables**

Create `src/lib/db/schema.sql`:

```sql
-- Portfolio Database Schema (MySQL)
-- Run this against your MySQL database to initialize all tables.

-- Jobs system (migrated from PostgreSQL)

CREATE TABLE IF NOT EXISTS jobs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  external_id   VARCHAR(255) NOT NULL,
  platform      VARCHAR(50) DEFAULT 'indeed',
  title         VARCHAR(500) NOT NULL,
  company       VARCHAR(255),
  location      VARCHAR(255),
  job_url       VARCHAR(1000),
  description   TEXT,
  salary_range  VARCHAR(255),
  job_type      VARCHAR(100),
  work_mode     VARCHAR(50),
  match_score   INT DEFAULT 0,
  matched_skills JSON,
  status        VARCHAR(20) DEFAULT 'new',
  notes         TEXT,
  posted_at     VARCHAR(100),
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_external (external_id, platform)
);

CREATE TABLE IF NOT EXISTS cron_logs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  ran_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  jobs_found    INT DEFAULT 0,
  jobs_new      INT DEFAULT 0,
  jobs_updated  INT DEFAULT 0,
  errors        JSON,
  duration_ms   INT DEFAULT 0,
  status        VARCHAR(20) DEFAULT 'running'
);

CREATE TABLE IF NOT EXISTS profile_config (
  id                VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  target_roles      JSON,
  primary_skills    JSON,
  secondary_skills  JSON,
  negative_keywords JSON,
  location_prefs    JSON,
  weights           JSON,
  min_score         INT DEFAULT 30,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resume tailor system

CREATE TABLE IF NOT EXISTS tailored_resumes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  job_title       VARCHAR(255) NOT NULL,
  company         VARCHAR(255),
  jd_text         TEXT NOT NULL,
  jd_url          VARCHAR(500),
  tailored_data   JSON NOT NULL,
  skills_included JSON,
  skills_excluded JSON,
  match_score     INT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/db/schema.sql
git commit -m "chore: add MySQL schema for jobs and tailored resumes"
```

---

### Task 3: Create Claude CLI wrapper

**Files:**
- Create: `src/lib/claude.ts`

- [ ] **Step 1: Create the Claude CLI wrapper**

Create `src/lib/claude.ts`:

```typescript
import { execFile } from 'child_process';
import { readFile } from 'fs/promises';
import path from 'path';

export interface TailorAnalysis {
  matchScore: number;
  jobTitle: string;
  company: string;
  suggestedSummary: string;
  skillAnalysis: {
    matched: string[];
    inResumeNotJD: string[];
    inJDNotResume: string[];
  };
  tailoredBullets: Record<string, string[]>;
  skillsReordered: string[];
}

const PORTFOLIO_PATH = path.join(process.cwd(), 'src/data/portfolio.json');

function buildPrompt(portfolioJson: string, jdText: string): string {
  return `You are a resume tailoring expert. Analyze the job description below against the candidate's portfolio data and produce a tailored resume.

IMPORTANT RULES:
- NEVER fabricate experience, skills, or achievements. Only use facts from the portfolio data.
- Rewrite bullet points to emphasize aspects relevant to this JD, but keep them truthful.
- Reorder skills to prioritize what the JD requires.
- Rewrite the professional summary to align with this specific role.

PORTFOLIO DATA:
${portfolioJson}

JOB DESCRIPTION:
${jdText}

Respond with ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "matchScore": <number 0-100>,
  "jobTitle": "<extracted job title>",
  "company": "<extracted company name>",
  "suggestedSummary": "<2-3 sentence summary tailored to this role>",
  "skillAnalysis": {
    "matched": ["<skills in both resume and JD>"],
    "inResumeNotJD": ["<skills in resume but not in JD>"],
    "inJDNotResume": ["<skills JD wants but candidate doesn't have>"]
  },
  "tailoredBullets": {
    "0": ["<rewritten bullets for careerData[0]>"],
    "1": ["<rewritten bullets for careerData[1]>"],
    "2": ["<rewritten bullets for careerData[2]>"],
    "3": ["<rewritten bullets for careerData[3]>"],
    "4": ["<rewritten bullets for careerData[4]>"],
    "5": ["<rewritten bullets for careerData[5]>"],
    "6": ["<rewritten bullets for careerData[6]>"]
  },
  "skillsReordered": ["<all candidate skills reordered by JD relevance>"]
}`;
}

export async function analyzeJD(jdText: string): Promise<TailorAnalysis> {
  const portfolioJson = await readFile(PORTFOLIO_PATH, 'utf-8');
  const prompt = buildPrompt(portfolioJson, jdText);

  return new Promise((resolve, reject) => {
    const child = execFile(
      'claude',
      ['-p', '--output-format', 'json'],
      {
        maxBuffer: 1024 * 1024 * 5, // 5MB
        timeout: 120_000, // 2 min
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Claude CLI failed: ${error.message}. stderr: ${stderr}`));
          return;
        }

        try {
          // Claude --output-format json wraps response in a JSON envelope
          const envelope = JSON.parse(stdout);
          // The actual text content is in envelope.result or envelope.content
          const textContent = typeof envelope === 'string'
            ? envelope
            : envelope.result ?? envelope.content ?? stdout;

          // Parse the inner JSON from Claude's text response
          const jsonStr = typeof textContent === 'string' ? textContent : JSON.stringify(textContent);
          // Extract JSON from possible markdown code fences
          const cleaned = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const analysis: TailorAnalysis = JSON.parse(cleaned);
          resolve(analysis);
        } catch (parseError) {
          reject(new Error(`Failed to parse Claude response: ${parseError}. Raw: ${stdout.substring(0, 500)}`));
        }
      }
    );

    // Write prompt to stdin
    if (child.stdin) {
      child.stdin.write(prompt);
      child.stdin.end();
    }
  });
}
```

- [ ] **Step 2: Verify build passes**

```bash
NEXT_DISABLE_TURBOPACK=1 npx next build
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/claude.ts
git commit -m "feat: add Claude CLI wrapper for JD analysis"
```

---

### Task 4: Create resume tailor API routes

**Files:**
- Create: `src/app/api/resume/tailor/route.ts`
- Create: `src/app/api/resume/tailor/save/route.ts`
- Create: `src/app/api/resume/tailor/[id]/route.ts`
- Create: `src/app/api/resume/tailor/history/route.ts`

- [ ] **Step 1: Create the analyze endpoint**

Create `src/app/api/resume/tailor/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { analyzeJD } from '@/lib/claude';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return !!token?.value;
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { jdText, jdUrl } = await request.json();

    let text = jdText || '';

    // If URL provided and no text, try to fetch the page
    if (!text && jdUrl) {
      try {
        const res = await fetch(jdUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        const html = await res.text();
        // Strip HTML tags for plain text extraction
        text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 15000); // Limit to prevent huge prompts
      } catch {
        return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 400 });
      }
    }

    if (!text) {
      return NextResponse.json({ error: 'Provide jdText or jdUrl' }, { status: 400 });
    }

    const analysis = await analyzeJD(text);
    return NextResponse.json({ analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create the save endpoint**

Create `src/app/api/resume/tailor/save/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return !!token?.value;
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { jobTitle, company, jdText, jdUrl, tailoredData, skillsIncluded, skillsExcluded, matchScore } = await request.json();

    if (!jobTitle || !jdText || !tailoredData) {
      return NextResponse.json({ error: 'Missing required fields: jobTitle, jdText, tailoredData' }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tailored_resumes (job_title, company, jd_text, jd_url, tailored_data, skills_included, skills_excluded, match_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        jobTitle,
        company || null,
        jdText,
        jdUrl || null,
        JSON.stringify(tailoredData),
        JSON.stringify(skillsIncluded || []),
        JSON.stringify(skillsExcluded || []),
        matchScore || null,
      ]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tailored_resumes WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json({ resume: rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Save failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create the get/delete endpoint**

Create `src/app/api/resume/tailor/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return !!token?.value;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM tailored_resumes WHERE id = ?',
    [id]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ resume: rows[0] });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM tailored_resumes WHERE id = ?',
    [id]
  );

  if (result.affectedRows === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Create the history endpoint**

Create `src/app/api/resume/tailor/history/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return !!token?.value;
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, job_title, company, match_score, created_at FROM tailored_resumes ORDER BY created_at DESC'
  );

  return NextResponse.json({ resumes: rows });
}
```

- [ ] **Step 5: Verify build passes**

```bash
NEXT_DISABLE_TURBOPACK=1 npx next build
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/resume/tailor/
git commit -m "feat: add resume tailor API routes (analyze, save, history, get/delete)"
```

---

### Task 5: Create tailored resume view page

**Files:**
- Create: `src/app/resume/tailored/[id]/page.tsx`

- [ ] **Step 1: Create the tailored resume page**

Create `src/app/resume/tailored/[id]/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { PrintButton } from '../../PrintButton';

interface TailoredData {
  summary: string;
  skills: string[];
  techCategories: { label: string; items: string[] }[];
  career: {
    role: string;
    company: string;
    period: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    field: string;
    institution: string;
    year: string;
  }[];
  siteConfig: {
    name: string;
    title: string;
    yearsOfExperience: string;
    location: string;
    phone: string;
    email: string;
    website: string;
    linkedin: string;
    github: string;
  };
}

export default async function TailoredResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM tailored_resumes WHERE id = ?',
    [id]
  );

  if (rows.length === 0) notFound();

  const record = rows[0];
  const data: TailoredData = typeof record.tailored_data === 'string'
    ? JSON.parse(record.tailored_data)
    : record.tailored_data;

  return (
    <article className="mx-auto max-w-[800px] bg-white px-10 py-12 text-[#111] print:px-0 print:py-0">
      {/* Navigation — hidden in print */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <a
          href="/admin-panel-9x7k"
          className="text-sm text-gray-500 underline hover:text-gray-800"
        >
          &larr; Back to admin
        </a>
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700">
            Tailored for: {record.job_title}{record.company ? ` @ ${record.company}` : ''}
          </span>
          <PrintButton />
        </div>
      </div>

      {/* ── HEADER ── */}
      <header className="mb-5 border-b border-gray-300 pb-4">
        <h1 className="text-[26px] font-bold tracking-tight">
          {data.siteConfig.name}
        </h1>
        <p className="mt-0.5 text-[15px] font-medium text-gray-700">
          {data.siteConfig.title} | {data.siteConfig.yearsOfExperience} Years of Experience
        </p>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] text-gray-600">
          {data.siteConfig.location && <span>{data.siteConfig.location}</span>}
          {data.siteConfig.phone && <span>{data.siteConfig.phone}</span>}
          {data.siteConfig.email && <span>{data.siteConfig.email}</span>}
          {data.siteConfig.website && <span>{data.siteConfig.website}</span>}
          {data.siteConfig.linkedin && <span>{data.siteConfig.linkedin}</span>}
          {data.siteConfig.github && <span>{data.siteConfig.github}</span>}
        </p>
      </header>

      {/* ── PROFESSIONAL SUMMARY ── */}
      <section className="mb-5">
        <h2 className="mb-2 text-[13px] font-bold uppercase tracking-[2px] text-gray-900">
          Professional Summary
        </h2>
        <p className="text-[13.5px] leading-[1.55] text-gray-700">
          {data.summary}
        </p>
      </section>

      {/* ── CORE COMPETENCIES ── */}
      <section className="mb-5">
        <h2 className="mb-2 text-[13px] font-bold uppercase tracking-[2px] text-gray-900">
          Core Competencies
        </h2>
        <div className="text-[13px] leading-[1.6] text-gray-700">
          {data.techCategories.map((cat) => (
            <p key={cat.label} className="mb-0.5">
              <span className="font-semibold">{cat.label}:</span>{' '}
              {cat.items.join(' · ')}
            </p>
          ))}
        </div>
      </section>

      {/* ── PROFESSIONAL EXPERIENCE ── */}
      <section className="mb-5">
        <h2 className="mb-2 text-[13px] font-bold uppercase tracking-[2px] text-gray-900">
          Professional Experience
        </h2>
        {data.career.map((job, i) => (
          <div key={i} className="mb-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[14px] font-bold">{job.role}</h3>
              <span className="shrink-0 text-[12.5px] text-gray-500">{job.period}</span>
            </div>
            <p className="text-[13px] text-gray-600">{job.company}</p>
            <ul className="mt-1 list-disc pl-5 space-y-0.5">
              {job.bullets.map((bullet, j) => (
                <li key={j} className="text-[13px] leading-[1.5] text-gray-700">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* ── EDUCATION ── */}
      {data.education && data.education.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 text-[13px] font-bold uppercase tracking-[2px] text-gray-900">
            Education
          </h2>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[13.5px] font-semibold">
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                </h3>
                <span className="text-[12.5px] text-gray-500">{edu.year}</span>
              </div>
              <p className="text-[13px] text-gray-600">{edu.institution}</p>
            </div>
          ))}
        </section>
      )}

      {/* Print styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: white !important; color: #111 !important; -webkit-print-color-adjust: exact; }
              @page { margin: 0.5in 0.6in; size: A4; }
              a { color: #111 !important; text-decoration: none !important; }
              article { padding: 0 !important; max-width: none !important; }
            }
          `,
        }}
      />
    </article>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
NEXT_DISABLE_TURBOPACK=1 npx next build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/resume/tailored/
git commit -m "feat: add tailored resume view/print page"
```

---

### Task 6: Add Tailor Resume section to admin panel

**Files:**
- Modify: `src/app/admin-panel-9x7k/page.tsx`

This is the largest task — adds the full TailorResumeEditor with:
- JD input form
- Skill picker (matched/yours/missing columns)
- Resume preview
- History table

- [ ] **Step 1: Add "tailorResume" to SECTION_LIST**

In `src/app/admin-panel-9x7k/page.tsx`, find the `SECTION_LIST` array and add the new entry:

```typescript
const SECTION_LIST: { key: string; label: string }[] = [
  { key: "availability", label: "Availability" },
  { key: "siteConfig", label: "Site Config" },
  { key: "sectionHeadings", label: "Section Titles" },
  { key: "navLinks", label: "Navigation" },
  { key: "socialLinks", label: "Social Links" },
  { key: "aboutData", label: "About" },
  { key: "trendingSkills", label: "Trending Skills" },
  { key: "techStack", label: "Tech Stack" },
  { key: "techCategories", label: "Tech Categories" },
  { key: "whatIDo", label: "What I Do" },
  { key: "careerData", label: "Career" },
  { key: "projectsData", label: "Projects" },
  { key: "educationData", label: "Education" },
  { key: "certifications", label: "Certifications" },
  { key: "tailorResume", label: "Tailor Resume" },
];
```

- [ ] **Step 2: Add TailorAnalysis interface and TailorResumeEditor component**

Add the following component BEFORE the `Editor` function (after `CertificationsEditor`). This is a large component — add it as a single block:

```typescript
interface TailorAnalysis {
  matchScore: number;
  jobTitle: string;
  company: string;
  suggestedSummary: string;
  skillAnalysis: {
    matched: string[];
    inResumeNotJD: string[];
    inJDNotResume: string[];
  };
  tailoredBullets: Record<string, string[]>;
  skillsReordered: string[];
}

interface HistoryItem {
  id: number;
  job_title: string;
  company: string;
  match_score: number;
  created_at: string;
}

function TailorResumeEditor({ portfolioData }: { portfolioData: PortfolioData }) {
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<TailorAnalysis | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"tailor" | "history">("tailor");

  // Load history on mount
  useEffect(() => {
    fetch("/api/resume/tailor/history")
      .then((r) => r.ok ? r.json() : { resumes: [] })
      .then((d) => setHistory(d.resumes || []))
      .catch(() => {});
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError("");
    setAnalysis(null);
    try {
      const res = await fetch("/api/resume/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText, jdUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAnalysis(data.analysis);
      // Pre-select matched skills
      setSelectedSkills(new Set(data.analysis.skillsReordered));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  };

  const handleSave = async () => {
    if (!analysis) return;
    setSaving(true);

    const allSkills = [...portfolioData.techStack, ...portfolioData.techCategories.flatMap((c) => c.items)];
    const uniqueSkills = [...new Set(allSkills)];
    const included = uniqueSkills.filter((s) => selectedSkills.has(s));
    const excluded = uniqueSkills.filter((s) => !selectedSkills.has(s));

    // Build tailored data for the resume page
    const linkedin = portfolioData.socialLinks.find((l) => l.name === "LinkedIn");
    const github = portfolioData.socialLinks.find((l) => l.name === "GitHub");

    const tailoredData = {
      summary: analysis.suggestedSummary,
      skills: [...selectedSkills],
      techCategories: portfolioData.techCategories.map((cat) => ({
        label: cat.label,
        items: cat.items.filter((item) => selectedSkills.has(item)),
      })).filter((cat) => cat.items.length > 0),
      career: portfolioData.careerData.map((job, i) => ({
        role: job.role,
        company: job.company,
        period: job.period,
        bullets: analysis.tailoredBullets[String(i)] || job.bullets || [job.description],
      })),
      education: portfolioData.educationData,
      siteConfig: {
        name: portfolioData.siteConfig.name,
        title: portfolioData.siteConfig.title,
        yearsOfExperience: portfolioData.siteConfig.yearsOfExperience,
        location: portfolioData.siteConfig.location,
        phone: portfolioData.siteConfig.phone,
        email: portfolioData.siteConfig.email,
        website: portfolioData.siteConfig.website,
        linkedin: linkedin?.url || "",
        github: github?.url || "",
      },
    };

    try {
      const res = await fetch("/api/resume/tailor/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: analysis.jobTitle,
          company: analysis.company,
          jdText,
          jdUrl: jdUrl || null,
          tailoredData,
          skillsIncluded: included,
          skillsExcluded: excluded,
          matchScore: analysis.matchScore,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      // Refresh history
      const histRes = await fetch("/api/resume/tailor/history");
      const histData = await histRes.json();
      setHistory(histData.resumes || []);
      // Open the saved resume in a new tab
      window.open(`/resume/tailored/${data.resume.id}`, "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/resume/tailor/${id}`, { method: "DELETE" });
    setHistory((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("tailor")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "tailor"
              ? "bg-[#5eead4] text-[#0a0e17]"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10"
          }`}
        >
          Tailor Resume
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "bg-[#5eead4] text-[#0a0e17]"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10"
          }`}
        >
          History ({history.length})
        </button>
      </div>

      {activeTab === "history" && (
        <div className="space-y-3">
          {history.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-neutral-500">No tailored resumes yet.</p>
          )}
          {history.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-white/5 p-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.job_title}{item.company ? ` — ${item.company}` : ""}
                </p>
                <p className="text-xs text-gray-500 dark:text-neutral-500">
                  {new Date(item.created_at).toLocaleDateString()} · {item.match_score}% match
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/resume/tailored/${item.id}`}
                  target="_blank"
                  className="rounded-lg border border-gray-300 dark:border-white/10 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
                >
                  View
                </a>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg border border-red-300 dark:border-red-500/30 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "tailor" && (
        <>
          {/* Step 1: Input */}
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Paste Job Description</label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={8}
                className={inputCls + " resize-y"}
                placeholder="Paste the full job description here..."
              />
            </div>
            <Field label="Job URL (optional)" value={jdUrl} onChange={setJdUrl} placeholder="https://linkedin.com/jobs/..." />
            <button
              onClick={handleAnalyze}
              disabled={analyzing || (!jdText && !jdUrl)}
              className={btnPrimary}
            >
              {analyzing ? "Analyzing with Claude..." : "Analyze Job Description"}
            </button>
            {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
          </div>

          {/* Step 2: Skill Picker */}
          {analysis && (
            <div className="space-y-6 rounded-xl border border-gray-200 dark:border-white/5 p-6">
              {/* Match score header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {analysis.jobTitle}{analysis.company ? ` @ ${analysis.company}` : ""}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-neutral-400">Select skills to include in tailored resume</p>
                </div>
                <span className={`rounded-full px-4 py-2 text-sm font-bold ${
                  analysis.matchScore >= 70 ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                  : analysis.matchScore >= 40 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
                  : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                }`}>
                  {analysis.matchScore}% Match
                </span>
              </div>

              {/* Skill columns */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* Matched */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-green-700 dark:text-green-400">
                    Matched Skills ({analysis.skillAnalysis.matched.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skillAnalysis.matched.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                          selectedSkills.has(skill)
                            ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300"
                            : "bg-gray-100 text-gray-400 line-through dark:bg-white/5 dark:text-neutral-600"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* In resume, not in JD */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-600 dark:text-neutral-400">
                    Your Other Skills ({analysis.skillAnalysis.inResumeNotJD.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skillAnalysis.inResumeNotJD.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                          selectedSkills.has(skill)
                            ? "bg-gray-200 text-gray-800 dark:bg-white/10 dark:text-neutral-200"
                            : "bg-gray-100 text-gray-400 line-through dark:bg-white/5 dark:text-neutral-600"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* In JD, not in resume */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-red-600 dark:text-red-400">
                    Missing from Profile ({analysis.skillAnalysis.inJDNotResume.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skillAnalysis.inJDNotResume.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tailored Summary Preview */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-neutral-300">Tailored Summary</h4>
                <p className="rounded-lg bg-gray-50 dark:bg-white/5 p-4 text-sm leading-relaxed text-gray-700 dark:text-neutral-300">
                  {analysis.suggestedSummary}
                </p>
              </div>

              {/* Save button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={btnPrimary}
                >
                  {saving ? "Saving..." : "Save & View Tailored Resume"}
                </button>
                <p className="text-xs text-gray-400 dark:text-neutral-600">
                  Opens in a new tab for printing/download
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Wire TailorResumeEditor into the renderEditor switch**

In the `renderEditor` function inside `Editor`, add the new case BEFORE the `default`:

```typescript
      case "tailorResume":
        return <TailorResumeEditor portfolioData={allData} />;
```

- [ ] **Step 4: Verify build passes**

```bash
NEXT_DISABLE_TURBOPACK=1 npx next build
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin-panel-9x7k/page.tsx
git commit -m "feat: add Tailor Resume section to admin panel with skill picker and history"
```

---

### Task 7: Environment setup and final verification

- [ ] **Step 1: Add DATABASE_URL to .env**

Add to `.env`:

```
DATABASE_URL=mysql://newuser:newpassword@127.0.0.1:3306/portfolio_db
```

(User will provide actual credentials for their Jenkins pipeline.)

- [ ] **Step 2: Update .env.example**

Add `DATABASE_URL` to `.env.example`:

```
DATABASE_URL=mysql://user:pass@127.0.0.1:3306/portfolio_db
```

- [ ] **Step 3: Remove vercel.json cron (no longer on Vercel)**

Delete the cron config from `vercel.json` or remove the file if it only contains crons, since the app is self-hosted now.

- [ ] **Step 4: Full build verification**

```bash
NEXT_DISABLE_TURBOPACK=1 npx next build
```

Expected: All routes build successfully including new `/resume/tailored/[id]` (dynamic) and `/api/resume/tailor/*` routes.

- [ ] **Step 5: Commit**

```bash
git add .env.example vercel.json
git commit -m "chore: update env config for MySQL, remove Vercel cron"
```

---

## Summary of commits

1. `refactor: replace PostgreSQL with MySQL (mysql2)` — Task 1
2. `chore: add MySQL schema for jobs and tailored resumes` — Task 2
3. `feat: add Claude CLI wrapper for JD analysis` — Task 3
4. `feat: add resume tailor API routes (analyze, save, history, get/delete)` — Task 4
5. `feat: add tailored resume view/print page` — Task 5
6. `feat: add Tailor Resume section to admin panel with skill picker and history` — Task 6
7. `chore: update env config for MySQL, remove Vercel cron` — Task 7
