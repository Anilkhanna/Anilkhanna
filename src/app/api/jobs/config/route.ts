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
