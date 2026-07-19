import { NextRequest, NextResponse } from "next/server";
import { subscribe } from "@/lib/push";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { endpoint, keys } = await req.json();
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }
    await subscribe(endpoint, keys.p256dh, keys.auth);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
