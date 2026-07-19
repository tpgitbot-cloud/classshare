import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { comparePassword, generateToken } from "@/lib/auth";
import { ensureDefaultAdmin, ensureDefaultSettings } from "@/lib/db-helpers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await ensureDefaultAdmin();
    await ensureDefaultSettings();

    const body = await req.json();
    const { username, email, password } = body;

    if (!password || (!username && !email)) {
      return NextResponse.json({ error: "Username/email and password required" }, { status: 400 });
    }

    const identifier = username || email;
    const isEmail = identifier.includes("@");

    let adminRow;
    if (isEmail) {
      const rows = await db.select().from(admins).where(eq(admins.email, identifier.toLowerCase())).limit(1);
      adminRow = rows[0];
    } else {
      const rows = await db.select().from(admins).where(eq(admins.username, identifier)).limit(1);
      adminRow = rows[0];
    }

    if (!adminRow) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (adminRow.status !== "active") {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 403 });
    }

    const isValid = await comparePassword(password, adminRow.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Update last login
    await db.update(admins).set({ lastLogin: new Date(), updatedAt: new Date() }).where(eq(admins.id, adminRow.id));

    const token = generateToken({ id: adminRow.id, role: adminRow.role, email: adminRow.email });

    const response = NextResponse.json({
      success: true,
      token,
      admin: {
        id: adminRow.id,
        name: adminRow.name,
        email: adminRow.email,
        username: adminRow.username,
        role: adminRow.role,
        status: adminRow.status,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (e: any) {
    console.error("Login error", e);
    const message = e instanceof Error ? e.message : String(e);
    console.error("Login error", e);
    return NextResponse.json({ error: "Internal server error", detail: message }, { status: 500 });
  }
}
