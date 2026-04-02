# Resume Tailor System — Design Spec

**Date:** 2026-04-02
**Status:** Approved

## Problem

Same resume gets rejected across different jobs because each JD expects different skill emphasis, keyword density, and experience framing. Manually tailoring per job is time-consuming.

## Solution

An in-app system that analyzes a job description, compares it against the user's master resume data, provides interactive skill selection, and generates a tailored ATS-friendly resume — all saved to MySQL for history tracking.

## User Flow

1. Admin Panel → **Tailor Resume** section
2. Paste JD text or URL → click **Analyze**
3. Claude CLI analyzes JD against `portfolio.json`
4. **Skill Picker** appears:
   - Matched skills (green, pre-checked) — in resume AND JD
   - Your other skills (neutral, unchecked) — in resume, not in JD, toggle to include
   - Missing from profile (red, info only) — JD wants these, user doesn't have them
5. **Preview** tailored resume with rewritten summary, reordered skills, adapted bullets
6. **Save & Download** — record persisted to MySQL, PDF via browser print
7. **History table** — view, download, or delete any previously tailored resume

## Architecture

```
Admin Panel ("Tailor Resume" section)
    ↓
POST /api/resume/tailor          ← JD text or URL
    ├── If URL → fetch page, extract JD text
    ├── Spawn Claude CLI: echo "<prompt>" | claude -p --output-format json
    │   ├── Input: full portfolio.json + JD text
    │   └── Output: structured JSON (see Claude Response Schema)
    └── Return analysis to frontend
    ↓
Frontend: Skill picker + live preview
    ↓
POST /api/resume/tailor/save     ← save final tailored version
    ├── Write to MySQL tailored_resumes table
    └── Return saved record with ID
    ↓
GET /resume/tailored/[id]        ← view/print any saved tailored resume
```

## Claude CLI Integration

### Wrapper: `src/lib/claude.ts`

Spawns Claude CLI as a child process:
```bash
echo "<prompt>" | claude -p --output-format json
```

- Non-interactive (`-p` flag)
- Returns JSON (`--output-format json`)
- No API key needed — uses existing CLI authentication
- Zero cost — runs on server with CLI subscription

### Claude Response Schema

```json
{
  "matchScore": 82,
  "jobTitle": "Senior Flutter Developer",
  "company": "BMW",
  "suggestedSummary": "Rewritten professional summary emphasizing JD-relevant experience...",
  "skillAnalysis": {
    "matched": ["Flutter", "Dart", "CI/CD"],
    "inResumeNotJD": ["Objective-C", "Ionic"],
    "inJDNotResume": ["Kotlin", "Jetpack Compose"]
  },
  "tailoredBullets": {
    "0": ["rewritten bullet 1 for role 0", "rewritten bullet 2", "..."],
    "1": ["rewritten bullet 1 for role 1", "..."]
  },
  "skillsReordered": ["Flutter", "Dart", "CI/CD", "Swift", "..."]
}
```

### Prompt Strategy

The prompt will:
1. Provide full `portfolio.json` career data, skills, and about paragraphs as context
2. Provide the raw JD text
3. Ask Claude to:
   - Extract key requirements, skills, and keywords from the JD
   - Score how well the profile matches (0-100)
   - Identify matched/unmatched/missing skills
   - Rewrite bullets to emphasize JD-relevant experience using original facts (no fabrication)
   - Rewrite professional summary to align with the role
   - Reorder skills to prioritize JD requirements
4. Require JSON output matching the schema above

## Database (MySQL)

### Connection

- Package: `mysql2` (with promise wrapper)
- Connection pool in `src/lib/db.ts`
- Environment variable: `DATABASE_URL=mysql://user:pass@host:port/database`

### New Table: `tailored_resumes`

```sql
CREATE TABLE tailored_resumes (
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

### Migration: Jobs System (pg → mysql2)

Existing PostgreSQL tables migrated to MySQL:

```sql
CREATE TABLE jobs (
  id              VARCHAR(255) PRIMARY KEY,
  title           VARCHAR(500) NOT NULL,
  company         VARCHAR(255),
  location        VARCHAR(255),
  description     TEXT,
  url             VARCHAR(1000),
  source          VARCHAR(50) DEFAULT 'indeed',
  salary          VARCHAR(255),
  job_type        VARCHAR(100),
  date_posted     VARCHAR(100),
  match_score     INT DEFAULT 0,
  match_reasons   JSON,
  status          VARCHAR(20) DEFAULT 'new',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE cron_logs (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  started_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at    TIMESTAMP NULL,
  jobs_found      INT DEFAULT 0,
  jobs_new        INT DEFAULT 0,
  jobs_updated    INT DEFAULT 0,
  errors          JSON,
  status          VARCHAR(20) DEFAULT 'running'
);

CREATE TABLE profile_config (
  id              INT PRIMARY KEY DEFAULT 1,
  config          JSON NOT NULL,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Key MySQL syntax differences from PostgreSQL:
- `SERIAL` → `INT AUTO_INCREMENT`
- `JSONB` → `JSON`
- `ON CONFLICT` → `ON DUPLICATE KEY UPDATE`
- `NOW()` → `CURRENT_TIMESTAMP`
- No `RETURNING *` — use `LAST_INSERT_ID()` + SELECT

## Admin Panel UI

### New Section: "Tailor Resume"

Added to `SECTION_LIST` in admin panel.

**Step 1 — Input:**
- Textarea: "Paste Job Description"
- Input field: "Job URL (optional)"
- Button: "Analyze with Claude"
- Loading state while Claude CLI processes

**Step 2 — Skill Picker:**
- Three-column layout:
  - **Matched** (green badges, checked by default)
  - **Your Other Skills** (gray badges, unchecked, toggleable)
  - **Missing from Profile** (red badges, info only, not toggleable)
- Match score badge (e.g., "82% Match")
- Job title and company extracted from JD

**Step 3 — Preview:**
- Renders tailored resume using same layout as `/resume/page.tsx`
- Summary, skills, and bullets reflect Claude's suggestions + user's skill selections
- "Save & Download" button

**Step 4 — History:**
- Table with columns: Date, Job Title, Company, Match Score, Actions
- Actions: View, Download, Delete
- Clicking View navigates to `/resume/tailored/[id]`

### Tailored Resume Page: `/resume/tailored/[id]`

- Same ATS-friendly layout as `/resume`
- Renders from `tailored_data` JSON stored in MySQL
- Print button for PDF generation
- "Back to Admin" link (hidden in print)

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `src/lib/db.ts` | MySQL connection pool (mysql2) |
| `src/lib/claude.ts` | Claude CLI child process wrapper |
| `src/lib/db/schema.sql` | All MySQL table definitions |
| `src/app/api/resume/tailor/route.ts` | POST — analyze JD |
| `src/app/api/resume/tailor/save/route.ts` | POST — save tailored resume |
| `src/app/api/resume/tailor/[id]/route.ts` | GET/DELETE — retrieve or remove saved resume |
| `src/app/resume/tailored/[id]/page.tsx` | View/print tailored resume |

### Modified Files

| File | Change |
|------|--------|
| `src/app/admin-panel-9x7k/page.tsx` | Add "Tailor Resume" section with skill picker, preview, history |
| `src/lib/jobs/db.ts` | Rewrite all PostgreSQL queries to MySQL syntax |
| `package.json` | Remove `pg`, add `mysql2` |

### Removed Dependencies

- `pg` (PostgreSQL client)
- `@types/pg` (if present)

## Environment Variables

```env
# New — MySQL connection
DATABASE_URL=mysql://user:pass@127.0.0.1:3306/portfolio_db

# Existing — kept
ADMIN_PASSWORD=...
CRON_SECRET=...
RAPIDAPI_KEY=...
```

## Constraints

- Claude CLI must be installed and authenticated on the server
- MySQL server must be running on the same server (localhost:3306)
- No Anthropic API key needed — zero additional cost
- Resume tailoring is admin-only (behind existing auth)
- No data fabrication — Claude rewrites bullets using only facts from portfolio.json
