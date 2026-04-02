import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { analyzeJD } from '@/lib/claude';

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
    const { jdText, jdUrl } = await request.json();

    let text = jdText || '';

    // If URL provided and no text, try to fetch the page
    if (!text && jdUrl) {
      try {
        const res = await fetch(jdUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        const html = await res.text();
        // Strip HTML tags for plain text extraction
        text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 15000);
      } catch {
        return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 400 });
      }
    }

    if (!text) {
      return NextResponse.json({ error: 'Provide jdText or jdUrl' }, { status: 400 });
    }

    const analysis = await analyzeJD(text);
    return NextResponse.json({ analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
