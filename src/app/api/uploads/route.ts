import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { uploads, appSettings, qrTokens } from "@/db/schema";
import { eq, desc, and, gt, ilike, sql } from "drizzle-orm";
import { uploadToCloudinary, getCloudinaryFolderPath, getFileTypeFromName, getResourceType } from "@/lib/cloudinary";
import { pushRealtimeEvent, ensureDefaultSettings } from "@/lib/db-helpers";
import { authenticateRequest } from "@/lib/middleware";

export const runtime = "nodejs";

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

const ALLOWED_TYPES = ["pdf", "ppt", "pptx", "doc", "docx", "jpg", "jpeg", "png", "zip", "webp", "gif"];

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { admin } = auth;

    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || "";
    const department = url.searchParams.get("department") || "";
    const year = url.searchParams.get("year") || "";
    const section = url.searchParams.get("section") || "";
    const subject = url.searchParams.get("subject") || "";
    const status = url.searchParams.get("status") || "";
    const date = url.searchParams.get("date") || "";
    const sortBy = url.searchParams.get("sortBy") || "uploadDate";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
    const offset = (page - 1) * limit;

    let allUploads;
    try {
      allUploads = await db.select().from(uploads).where(eq(uploads.adminId, admin.id)).orderBy(desc(uploads.uploadDate));
    } catch {
      allUploads = await db.select().from(uploads).orderBy(desc(uploads.uploadDate));
    }

    // Filter
    if (search) {
      const s = search.toLowerCase();
      allUploads = allUploads.filter(
        (u) =>
          u.studentName.toLowerCase().includes(s) ||
          u.registerNumber.toLowerCase().includes(s) ||
          u.originalFileName.toLowerCase().includes(s) ||
          u.subject.toLowerCase().includes(s)
      );
    }
    if (department) allUploads = allUploads.filter((u) => u.department === department);
    if (year) allUploads = allUploads.filter((u) => u.year === year);
    if (section) allUploads = allUploads.filter((u) => u.section === section);
    if (subject) allUploads = allUploads.filter((u) => u.subject.toLowerCase().includes(subject.toLowerCase()));
    if (status) allUploads = allUploads.filter((u) => u.presentationStatus === status as any);
    if (date) {
      allUploads = allUploads.filter((u) => {
        const d = new Date(u.uploadDate).toISOString().split("T")[0];
        return d === date;
      });
    }

    // Sort
    allUploads.sort((a, b) => {
      let compare = 0;
      switch (sortBy) {
        case "studentName":
          compare = a.studentName.localeCompare(b.studentName);
          break;
        case "subject":
          compare = a.subject.localeCompare(b.subject);
          break;
        case "fileSize":
          compare = a.fileSize - b.fileSize;
          break;
        case "uploadDate":
        default:
          compare = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      }
      return sortOrder === "asc" ? compare : -compare;
    });

    const total = allUploads.length;
    const paginated = allUploads.slice(offset, offset + limit);

    // Distinct values for filters
    const departments = Array.from(new Set(allUploads.map((u) => u.department)));
    const years = Array.from(new Set(allUploads.map((u) => u.year)));
    const sections = Array.from(new Set(allUploads.map((u) => u.section)));
    const subjects = Array.from(new Set(allUploads.map((u) => u.subject)));

    return NextResponse.json({
      uploads: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      meta: { departments, years, sections, subjects },
    });
  } catch (e: any) {
    console.error("GET uploads error", e);
    return NextResponse.json({ error: "Failed to fetch uploads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDefaultSettings();
    const settingsRows = await db.select().from(appSettings).limit(1);
    const settings = settingsRows[0];

    // Check deadline
    if (settings?.uploadDeadline) {
      if (new Date() > new Date(settings.uploadDeadline)) {
        return NextResponse.json({ error: "Upload deadline has passed" }, { status: 400 });
      }
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const studentName = formData.get("studentName") as string;
    const registerNumber = formData.get("registerNumber") as string;
    const department = formData.get("department") as string;
    const year = formData.get("year") as string;
    const section = formData.get("section") as string;
    const subject = formData.get("subject") as string;
    const token = formData.get("token") as string | null;
    const replaceId = formData.get("replaceId") as string | null; // for replacing before deadline

    // Verify token and get adminId if present
    let adminId: string | null = null;
    if (token) {
      const rows = await db
        .select()
        .from(qrTokens)
        .where(and(eq(qrTokens.token, token), gt(qrTokens.expiresAt, new Date())))
        .limit(1);
      if (rows.length) adminId = rows[0].adminId;
    }

    if (!file || !studentName || !registerNumber || !department || !year || !section || !subject) {
      return NextResponse.json({ error: "All fields and file are required" }, { status: 400 });
    }

    const fileName = file.name;
    const fileType = getFileTypeFromName(fileName);
    if (!ALLOWED_TYPES.includes(fileType.toLowerCase())) {
      return NextResponse.json({ error: `File type .${fileType} not allowed` }, { status: 400 });
    }

    const maxSize = (settings?.maxFileSizeMb || 50) * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Max ${settings?.maxFileSizeMb}MB` }, { status: 400 });
    }

    // Duplicate detection: same registerNumber + original filename? Or same registerNumber + subject?
    const existingDup = await db
      .select()
      .from(uploads)
      .where(eq(uploads.registerNumber, registerNumber));

    const duplicate = existingDup.find(
      (u) =>
        u.subject.toLowerCase() === subject.toLowerCase() &&
        u.originalFileName.toLowerCase() === fileName.toLowerCase()
    );

    if (duplicate && !replaceId) {
      return NextResponse.json(
        {
          error: "Duplicate file detected - you already uploaded this file for this subject",
          duplicateId: duplicate.id,
          allowReplace: true,
        },
        { status: 409 }
      );
    }

    // If replaceId provided, delete old
    if (replaceId) {
      const existing = await db.select().from(uploads).where(eq(uploads.id, replaceId)).limit(1);
      if (existing.length) {
        const old = existing[0];
        const { deleteFromCloudinary } = await import("@/lib/cloudinary");
        await deleteFromCloudinary(old.cloudinaryPublicId, getResourceType(old.fileType));
        await db.delete(uploads).where(eq(uploads.id, replaceId));
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = getCloudinaryFolderPath(department, year, section, subject);

    const uploadResult = await uploadToCloudinary(buffer, {
      folder,
      originalFilename: fileName,
      resourceType: getResourceType(fileType),
    });

    const uploadData = {
      id: makeId(),
      studentName: studentName.trim(),
      registerNumber: registerNumber.trim(),
      department: department.trim(),
      year: year.trim(),
      section: section.trim(),
      subject: subject.trim(),
      originalFileName: fileName,
      displayFileName: fileName,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      fileType: fileType,
      fileSize: uploadResult.bytes || file.size,
      uploadDate: new Date(),
      presentationStatus: "pending" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (adminId) {
      await db.insert(uploads).values({ ...uploadData, adminId });
    } else {
      await db.insert(uploads).values(uploadData);
    }

    // Update storage
    if (settings) {
      await db
        .update(appSettings)
        .set({ storageUsed: (settings.storageUsed || 0) + newUpload.fileSize, updatedAt: new Date() })
        .where(eq(appSettings.id, settings.id));
    }

    pushRealtimeEvent({ type: "new_upload", data: newUpload });

    return NextResponse.json({ success: true, upload: newUpload });
  } catch (e: any) {
    console.error("POST upload error", e);
    return NextResponse.json({ error: "Upload failed: " + (e.message || "unknown") }, { status: 500 });
  }
}
