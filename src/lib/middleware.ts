import { NextRequest } from "next/server";
import { verifyToken, getTokenFromHeader } from "./auth";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function authenticateRequest(req: NextRequest) {
  // Try Authorization header
  const authHeader = req.headers.get("authorization");
  let token = getTokenFromHeader(authHeader);
  // Fallback to cookie
  if (!token) {
    token = req.cookies.get("token")?.value || null;
  }
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const adminRows = await db.select().from(admins).where(eq(admins.id, decoded.id)).limit(1);
  if (!adminRows.length) return null;
  const admin = adminRows[0];
  if (admin.status !== "active") return null;
  return { decoded, admin };
}

export function requireRole(adminRole: string, allowed: string[]) {
  return allowed.includes(adminRole);
}
