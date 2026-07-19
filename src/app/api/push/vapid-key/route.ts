import { NextResponse } from "next/server";
import { getVapidPublicKey } from "@/lib/push";

export const runtime = "nodejs";

export async function GET() {
  try {
    const publicKey = await getVapidPublicKey();
    return NextResponse.json({ publicKey });
  } catch {
    return NextResponse.json({ error: "Failed to get VAPID key" }, { status: 500 });
  }
}
