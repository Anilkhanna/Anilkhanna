import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
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

export async function deleteJob(id: string): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM jobs WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

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

// ── Stats ──

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

// ── Cron logs ──

export async function logCronRun(log: Omit<CronLog, 'id' | 'ran_at'>): Promise<void> {
  await pool.query(
    `INSERT INTO cron_logs (jobs_found, jobs_new, jobs_updated, errors, duration_ms, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [log.jobs_found, log.jobs_new, log.jobs_updated, JSON.stringify(log.errors), log.duration_ms, log.status]
  );
}

// ── Profile config ──

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
