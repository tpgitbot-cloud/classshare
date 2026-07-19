import { NextRequest, NextResponse } from "next/server";
import { generateQRDataUrl } from "@/lib/qr";
import { authenticateRequest } from "@/lib/middleware";
import { db } from "@/db";
import { qrTokens } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";

export const runtime = "nodejs";

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

const TOKEN_DURATION_SECONDS = 300;

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { admin } = auth;

  // Clean up expired tokens for this admin
  await db.delete(qrTokens).where(
    and(eq(qrTokens.adminId, admin.id), lt(qrTokens.expiresAt, new Date()))
  );

  // Generate a unique token
  const token = makeId() + Date.now().toString(36);
  const expiresAt = new Date(Date.now() + TOKEN_DURATION_SECONDS * 1000);

  await db.insert(qrTokens).values({
    id: makeId(),
    adminId: admin.id,
    token,
    expiresAt,
  });

  const origin = process.env.CLIENT_URL || "http://localhost:3000";
  const target = `${origin}/upload?token=${token}`;
  const dataUrl = await generateQRDataUrl(target);

  return NextResponse.json({
    qr: dataUrl,
    url: target,
    expiresAt: expiresAt.toISOString(),
    ttl: TOKEN_DURATION_SECONDS,
    adminName: admin.name,
  });
}
