import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { uploads } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1);
    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const upload = rows[0];

    const response = await fetch(upload.cloudinaryUrl);
    if (!response.ok) return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });

    const blob = await response.arrayBuffer();

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${upload.originalFileName}"`,
        "Content-Type": response.headers.get("content-type") || "application/octet-stream",
        "Content-Length": blob.byteLength.toString(),
      },
    });
  } catch (e: any) {
    console.error("Download error", e);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
