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
    'SELECT id, job_title, company, match_score, status, applied_at, created_at FROM tailored_resumes ORDER BY created_at DESC'
  );

  return NextResponse.json({ resumes: rows });
}
