import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST() {
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ success: true, message: "Login route works" });
  } catch (e: any) {
    return NextResponse.json({ error: "DB failed", detail: e.message }, { status: 500 });
  }
}
