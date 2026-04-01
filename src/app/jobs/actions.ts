'use server';

import { cookies } from 'next/headers';
import { runFetchPipeline } from '@/lib/jobs/fetchers';
import type { CronResult } from '@/lib/jobs/types';

export async function triggerFetchNow(): Promise<CronResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  if (!token?.value) {
    return { success: false, stats: { fetched: 0, matched: 0, new_jobs: 0, updated: 0 }, errors: ['Unauthorized'] };
  }
  return await runFetchPipeline();
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
}
