import { NextRequest, NextResponse } from "next/server";
import { getRealtimeEvents } from "@/lib/db-helpers";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const since = parseInt(url.searchParams.get("since") || "0");
  const events = getRealtimeEvents(since);
  return NextResponse.json({ events, timestamp: Date.now() });
}
