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
