import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

function parseDevice(ua: string): string {
  if (/mobile|android|iphone|ipad/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
}

function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  return 'Other';
}

export async function POST(request: NextRequest) {
  try {
    const { path, referrer } = await request.json();
    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

    // Skip admin and API paths
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return NextResponse.json({ ok: true });
    }

    const ua = request.headers.get('user-agent') || '';
    const device = parseDevice(ua);
    const browser = parseBrowser(ua);

    // Get country from header (set by reverse proxy/CDN, or empty)
    const country = request.headers.get('x-vercel-ip-country')
      || request.headers.get('cf-ipcountry')
      || request.headers.get('x-country')
      || '';

    await pool.query(
      'INSERT INTO page_views (path, referrer, country, device, browser) VALUES (?, ?, ?, ?, ?)',
      [path.substring(0, 500), (referrer || '').substring(0, 1000), country.substring(0, 10), device, browser]
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Never fail the client
  }
}
