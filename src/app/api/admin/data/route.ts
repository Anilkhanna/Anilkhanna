import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  return !!token?.value;
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT data, updated_at FROM portfolio_data WHERE id = 1"
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "No data found. Run seed-portfolio.js first." }, { status: 404 });
    }

    const data = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
    return NextResponse.json({ data, updatedAt: rows[0].updated_at });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Admin data read failed:", message);
    return NextResponse.json({ error: `Failed to read data: ${message}` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await request.json();

    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const requiredKeys = [
      "siteConfig", "navLinks", "socialLinks", "sectionHeadings",
      "aboutData", "trendingSkills", "techStack", "techCategories",
      "whatIDo", "careerData", "projectsData", "educationData",
      "certifications", "availability", "testimonials", "caseStudies", "services",
    ];

    for (const key of requiredKeys) {
      if (!(key in data)) {
        return NextResponse.json({ error: `Missing required key: ${key}` }, { status: 400 });
      }
    }

    await pool.query(
      "INSERT INTO portfolio_data (id, data) VALUES (1, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)",
      [JSON.stringify(data)]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Admin data save failed:", message);
    return NextResponse.json({ error: `Failed to save data: ${message}` }, { status: 500 });
  }
}
