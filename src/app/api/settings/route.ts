import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { authenticateRequest } from "@/lib/middleware";
import { eq } from "drizzle-orm";
import { ensureDefaultSettings } from "@/lib/db-helpers";

export async function GET(req: NextRequest) {
  await ensureDefaultSettings();
  const rows = await db.select().from(appSettings).limit(1);
  return NextResponse.json({ settings: rows[0] });
}

export async function PUT(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.admin.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { uploadDeadline, maxFileSizeMb, classroomName } = body;

  const rows = await db.select().from(appSettings).limit(1);
  const existing = rows[0];

  const update: any = { updatedAt: new Date() };
  if (uploadDeadline !== undefined) update.uploadDeadline = uploadDeadline ? new Date(uploadDeadline) : null;
  if (maxFileSizeMb !== undefined) update.maxFileSizeMb = parseInt(maxFileSizeMb);
  if (classroomName !== undefined) update.classroomName = classroomName;

  await db.update(appSettings).set(update).where(eq(appSettings.id, existing.id));

  const updated = await db.select().from(appSettings).limit(1);
  return NextResponse.json({ success: true, settings: updated[0] });
}
