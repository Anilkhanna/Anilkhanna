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
