import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!password || !username) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const rows = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
    if (!rows.length) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const adminRow = rows[0];
    if (adminRow.status !== "active") {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 403 });
    }

    const bcrypt = await import("bcryptjs");
    const isValid = await bcrypt.compare(password, adminRow.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const jwt = await import("jsonwebtoken");
    const secret = process.env.JWT_SECRET || "classshare_super_secret_key_2024_production";
    const token = jwt.default.sign(
      { id: adminRow.id, role: adminRow.role, email: adminRow.email },
      secret,
      { expiresIn: "7d" }
    );

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
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Internal server error", detail: message }, { status: 500 });
  }
}
