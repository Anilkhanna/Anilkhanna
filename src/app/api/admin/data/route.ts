import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src/data/portfolio.json");

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
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return NextResponse.json({ data: JSON.parse(raw) });
  } catch {
    return NextResponse.json(
      { error: "Failed to read data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await request.json();

    // Validate it's valid JSON with expected structure
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    const requiredKeys = [
      "siteConfig",
      "navLinks",
      "socialLinks",
      "sectionHeadings",
      "aboutData",
      "trendingSkills",
      "techStack",
      "techCategories",
      "whatIDo",
      "careerData",
      "projectsData",
      "educationData",
      "certifications",
    ];

    for (const key of requiredKeys) {
      if (!(key in data)) {
        return NextResponse.json(
          { error: `Missing required key: ${key}` },
          { status: 400 }
        );
      }
    }

    // Backup current file
    try {
      const current = await fs.readFile(DATA_PATH, "utf-8");
      await fs.writeFile(DATA_PATH + ".backup", current, "utf-8");
    } catch {
      // Backup failed, continue anyway
    }

    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    );
  }
}
