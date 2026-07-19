import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await db.execute(sql`select 1`);
    const body = await req.json();
    const { username, password } = body;
    return NextResponse.json({ message: "ok", username, password: password ? "provided" : "missing" });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
