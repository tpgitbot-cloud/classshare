import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { authenticateRequest } from "@/lib/middleware";
import { hashPassword } from "@/lib/auth";

export const runtime = "nodejs";

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.admin.role !== "super_admin") return NextResponse.json({ error: "Forbidden - Super Admin only" }, { status: 403 });

  const rows = await db.select().from(admins).orderBy(desc(admins.createdAt));
  const sanitized = rows.map(({ password, ...rest }) => rest);
  return NextResponse.json({ admins: sanitized });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.admin.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, email, username, password, role } = body;

  if (!name || !email || !username || !password) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  // Check duplicate email/username
  const existingEmail = await db.select().from(admins).where(eq(admins.email, email.toLowerCase())).limit(1);
  if (existingEmail.length) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

  const existingUsername = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
  if (existingUsername.length) return NextResponse.json({ error: "Username already exists" }, { status: 409 });

  const hashed = await hashPassword(password);

  const newAdmin = {
    id: makeId(),
    name,
    email: email.toLowerCase(),
    username,
    password: hashed,
    role: role || "admin",
    status: "active" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(admins).values(newAdmin);

  const { password: _, ...sanitized } = newAdmin;
  return NextResponse.json({ success: true, admin: sanitized });
}
