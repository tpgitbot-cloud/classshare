import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authenticateRequest } from "@/lib/middleware";
import { hashPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.admin.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { name, email, username, role, status, password } = body;

  const existing = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
  if (!existing.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updateData: any = { updatedAt: new Date() };
  if (name) updateData.name = name;
  if (email) updateData.email = email.toLowerCase();
  if (username) updateData.username = username;
  if (role) updateData.role = role;
  if (status) updateData.status = status;
  if (password) {
    updateData.password = await hashPassword(password);
  }

  await db.update(admins).set(updateData).where(eq(admins.id, id));
  const updated = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
  const { password: _, ...sanitized } = updated[0];
  return NextResponse.json({ success: true, admin: sanitized });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.admin.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (id === auth.admin.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  const existing = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
  if (!existing.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(admins).where(eq(admins.id, id));
  return NextResponse.json({ success: true });
}
