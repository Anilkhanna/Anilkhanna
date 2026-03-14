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
