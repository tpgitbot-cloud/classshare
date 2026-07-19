import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { uploads, appSettings } from "@/db/schema";
import { authenticateRequest } from "@/lib/middleware";
import { count, eq, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { admin } = auth;
  const all = await db.select().from(uploads).where(eq(uploads.adminId, admin.id));
  const settingsRows = await db.select().from(appSettings).limit(1);
  const settings = settingsRows[0];

  const totalUploads = all.length;
  const pending = all.filter((u) => u.presentationStatus === "pending").length;
  const completed = all.filter((u) => u.presentationStatus === "completed").length;
  const totalStorage = all.reduce((sum, u) => sum + (u.fileSize || 0), 0);

  const departments = Array.from(new Set(all.map((u) => u.department))).length;
  const today = new Date().toISOString().split("T")[0];
  const todayUploads = all.filter((u) => new Date(u.uploadDate).toISOString().split("T")[0] === today).length;

  const recentUploads = all
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 5);

  const uploadsByDept = all.reduce((acc: any, cur) => {
    acc[cur.department] = (acc[cur.department] || 0) + 1;
    return acc;
  }, {});

  const uploadsBySubject = all.reduce((acc: any, cur) => {
    acc[cur.subject] = (acc[cur.subject] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    stats: {
      totalUploads,
      pending,
      completed,
      totalStorage,
      storageUsed: totalStorage,
      departments,
      todayUploads,
      maxFileSizeMb: settings?.maxFileSizeMb || 50,
      uploadDeadline: settings?.uploadDeadline || null,
      classroomName: settings?.classroomName || "ClassShare Classroom",
    },
    recentUploads,
    uploadsByDept,
    uploadsBySubject,
  });
}
