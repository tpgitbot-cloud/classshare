import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { uploads, appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authenticateRequest } from "@/lib/middleware";
import { deleteFromCloudinary, getResourceType } from "@/lib/cloudinary";
import { pushRealtimeEvent } from "@/lib/db-helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1);
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ upload: rows[0] });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { displayFileName, presentationStatus } = body;

  const existing = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1);
  if (!existing.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if ("adminId" in existing[0] && existing[0].adminId && existing[0].adminId !== auth.admin.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updateData: any = { updatedAt: new Date() };
  if (displayFileName) updateData.displayFileName = displayFileName;
  if (presentationStatus && ["pending", "completed"].includes(presentationStatus)) {
    updateData.presentationStatus = presentationStatus;
  }

  await db.update(uploads).set(updateData).where(eq(uploads.id, id));
  const updated = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1);

  pushRealtimeEvent({ type: "update_upload", data: updated[0] });

  return NextResponse.json({ success: true, upload: updated[0] });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const rows = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1);
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if ("adminId" in rows[0] && rows[0].adminId && rows[0].adminId !== auth.admin.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const upload = rows[0];

  // Delete from cloudinary
  await deleteFromCloudinary(upload.cloudinaryPublicId, getResourceType(upload.fileType));

  await db.delete(uploads).where(eq(uploads.id, id));

  // Update storage used
  const settingsRows = await db.select().from(appSettings).limit(1);
  if (settingsRows.length) {
    const s = settingsRows[0];
    await db
      .update(appSettings)
      .set({ storageUsed: Math.max(0, (s.storageUsed || 0) - upload.fileSize), updatedAt: new Date() })
      .where(eq(appSettings.id, s.id));
  }

  pushRealtimeEvent({ type: "delete_upload", data: { id } });

  return NextResponse.json({ success: true });
}
