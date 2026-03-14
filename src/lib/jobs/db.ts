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

  // Validate sort column (whitelist only — these are the only values interpolated into SQL)
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

  if (updates.status !== undefined) {
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
