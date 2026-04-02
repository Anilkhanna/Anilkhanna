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

  // Today, this week, this month counts
  const [totals] = await pool.query<RowDataPacket[]>(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN created_at >= CURDATE() THEN 1 ELSE 0 END) as today,
      SUM(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as week,
      SUM(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as month
    FROM page_views
  `);

  // Top pages (last 30 days)
  const [topPages] = await pool.query<RowDataPacket[]>(`
    SELECT path, COUNT(*) as views
    FROM page_views
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY path
    ORDER BY views DESC
    LIMIT 10
  `);

  // Daily views (last 14 days)
  const [dailyViews] = await pool.query<RowDataPacket[]>(`
    SELECT DATE(created_at) as date, COUNT(*) as views
    FROM page_views
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);

  // Device breakdown (last 30 days)
  const [devices] = await pool.query<RowDataPacket[]>(`
    SELECT device, COUNT(*) as count
    FROM page_views
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY device
    ORDER BY count DESC
  `);

  // Browser breakdown (last 30 days)
  const [browsers] = await pool.query<RowDataPacket[]>(`
    SELECT browser, COUNT(*) as count
    FROM page_views
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY browser
    ORDER BY count DESC
  `);

  // Top referrers (last 30 days)
  const [referrers] = await pool.query<RowDataPacket[]>(`
    SELECT referrer, COUNT(*) as count
    FROM page_views
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      AND referrer IS NOT NULL AND referrer != ''
    GROUP BY referrer
    ORDER BY count DESC
    LIMIT 10
  `);

  return NextResponse.json({
    totals: totals[0],
    topPages,
    dailyViews,
    devices,
    browsers,
    referrers,
  });
}
