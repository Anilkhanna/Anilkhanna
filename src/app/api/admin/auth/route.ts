import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-me-now-123!";
const TOKEN_COOKIE = "admin_token";
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || password !== ADMIN_PASSWORD) {
      // Add delay to prevent brute force
      await new Promise((r) => setTimeout(r, 1000));
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = generateToken();
    const cookieStore = await cookies();

    cookieStore.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: TOKEN_EXPIRY / 1000,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE);

  if (!token?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
  return NextResponse.json({ success: true });
}
