import { db } from "@/db";
import { admins, uploads, appSettings } from "@/db/schema";
import { eq, desc, and, ilike, sql } from "drizzle-orm";

export async function ensureDefaultAdmin() {
  const { hashPassword } = await import("./auth");
  const { v4: uuidv4 } = await import("uuid");

  const existing = await db.select().from(admins).limit(1);
  if (existing.length === 0) {
    const hashed = await hashPassword("SuperAdmin@123");
    await db.insert(admins).values({
      id: uuidv4(),
      name: "Super Admin",
      email: "superadmin@classshare.edu",
      username: "superadmin",
      password: hashed,
      role: "super_admin",
      status: "active",
    });
    console.log("Default super admin created: superadmin / SuperAdmin@123");
  }

  const gokulExists = await db.select().from(admins).where(eq(admins.username, "gokul")).limit(1);
  if (gokulExists.length === 0) {
    const hashed = await hashPassword("10022005");
    await db.insert(admins).values({
      id: uuidv4(),
      name: "Gokul",
      email: "gokul@classshare.edu",
      username: "gokul",
      password: hashed,
      role: "super_admin",
      status: "active",
    });
    console.log("Admin created: gokul / 10022005");
  }
}

export async function ensureDefaultSettings() {
  const existing = await db.select().from(appSettings).limit(1);
  if (existing.length === 0) {
    await db.insert(appSettings).values({
      id: "main",
      maxFileSizeMb: 1024,
      allowedFileTypes: "pdf,ppt,pptx,doc,docx,jpg,jpeg,png,zip",
      classroomName: "ClassShare Classroom",
      storageUsed: 0,
    });
  }
}

// Global real-time events store for SSE polling fallback
type UploadEvent = {
  type: "new_upload" | "delete_upload" | "update_upload";
  data: any;
  timestamp: number;
};

let events: UploadEvent[] = [];
export function pushRealtimeEvent(event: Omit<UploadEvent, "timestamp">) {
  events.push({ ...event, timestamp: Date.now() });
  // Keep only last 100 events
  if (events.length > 100) events = events.slice(-100);
}

export function getRealtimeEvents(since: number = 0): UploadEvent[] {
  return events.filter((e) => e.timestamp > since);
}
