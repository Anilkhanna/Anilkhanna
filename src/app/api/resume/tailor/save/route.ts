import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return !!token?.value;
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { jobTitle, company, jdText, jdUrl, tailoredData, skillsIncluded, skillsExcluded, matchScore } = await request.json();

    if (!jobTitle || !jdText || !tailoredData) {
      return NextResponse.json({ error: 'Missing required fields: jobTitle, jdText, tailoredData' }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tailored_resumes (job_title, company, jd_text, jd_url, tailored_data, skills_included, skills_excluded, match_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        jobTitle,
        company || null,
        jdText,
        jdUrl || null,
        JSON.stringify(tailoredData),
        JSON.stringify(skillsIncluded || []),
        JSON.stringify(skillsExcluded || []),
        matchScore || null,
      ]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tailored_resumes WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json({ resume: rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Save failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
