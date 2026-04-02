import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src/data/portfolio.json");

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  return !!token?.value;
}

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Read from DB
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT data FROM portfolio_data WHERE id = 1"
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "No data in database" }, { status: 404 });
    }

    const data = typeof rows[0].data === "string" ? rows[0].data : JSON.stringify(rows[0].data);
    const formatted = JSON.stringify(JSON.parse(data), null, 2);

    // Backup current file
    try {
      const current = await fs.readFile(DATA_PATH, "utf-8");
      await fs.writeFile(DATA_PATH + ".backup", current, "utf-8");
    } catch {
      // Backup failed, continue
    }

    // Write to portfolio.json
    await fs.writeFile(DATA_PATH, formatted, "utf-8");

    return NextResponse.json({ success: true, publishedAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Publish failed:", message);
    return NextResponse.json({ error: `Publish failed: ${message}` }, { status: 500 });
  }
}
