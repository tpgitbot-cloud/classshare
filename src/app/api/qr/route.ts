import { NextRequest, NextResponse } from "next/server";
import { generateQRDataUrl } from "@/lib/qr";
import { authenticateRequest } from "@/lib/middleware";
import { db } from "@/db";
import { qrTokens } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";

const TOKEN_DURATION_SECONDS = 60;

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { admin } = auth;

  // Clean up expired tokens for this admin
  await db.delete(qrTokens).where(
    and(eq(qrTokens.adminId, admin.id), eq(qrTokens.expiresAt, new Date(0)))
  );

  // Generate a unique token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_DURATION_SECONDS * 1000);

  await db.insert(qrTokens).values({
    id: crypto.randomUUID(),
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
