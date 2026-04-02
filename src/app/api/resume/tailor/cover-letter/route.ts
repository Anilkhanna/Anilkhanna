import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateCoverLetter } from '@/lib/claude';

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
    const { jdText, jobTitle, company } = await request.json();

    if (!jdText || !jobTitle) {
      return NextResponse.json({ error: 'Missing jdText and jobTitle' }, { status: 400 });
    }

    const coverLetter = await generateCoverLetter(jdText, jobTitle, company || '');
    return NextResponse.json({ coverLetter });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cover letter generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
