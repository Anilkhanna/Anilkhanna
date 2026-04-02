import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return !!token?.value;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM tailored_resumes WHERE id = ?',
    [id]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ resume: rows[0] });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { jobTitle, company, jdText, jdUrl, tailoredData, skillsIncluded, skillsExcluded, matchScore } = await request.json();

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE tailored_resumes
     SET job_title = ?, company = ?, jd_text = ?, jd_url = ?, tailored_data = ?,
         skills_included = ?, skills_excluded = ?, match_score = ?
     WHERE id = ?`,
    [
      jobTitle,
      company || null,
      jdText,
      jdUrl || null,
      JSON.stringify(tailoredData),
      JSON.stringify(skillsIncluded || []),
      JSON.stringify(skillsExcluded || []),
      matchScore || null,
      id,
    ]
  );

  if (result.affectedRows === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM tailored_resumes WHERE id = ?',
    [id]
  );

  if (result.affectedRows === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
