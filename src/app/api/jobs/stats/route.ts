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
