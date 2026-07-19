import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { qrTokens } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;
    if (!token) return NextResponse.json({ valid: false, error: "Token required" }, { status: 400 });

    const rows = await db
      .select()
      .from(qrTokens)
      .where(and(eq(qrTokens.token, token), gt(qrTokens.expiresAt, new Date())))
      .limit(1);

    if (!rows.length) return NextResponse.json({ valid: false, error: "Invalid or expired token" }, { status: 401 });

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false, error: "Verification failed" }, { status: 500 });
  }
}
