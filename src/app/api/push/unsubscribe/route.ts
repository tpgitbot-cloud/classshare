import { NextRequest, NextResponse } from "next/server";
import { unsubscribe } from "@/lib/push";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { endpoint } = await req.json();
    if (!endpoint) return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
    await unsubscribe(endpoint);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unsubscribe failed" }, { status: 500 });
  }
}
