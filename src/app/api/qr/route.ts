import { NextRequest, NextResponse } from "next/server";
import { generateQRDataUrl } from "@/lib/qr";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const target = url.searchParams.get("url") || `${process.env.CLIENT_URL || "http://localhost:3000"}/upload?src=qr`;
  const dataUrl = await generateQRDataUrl(target);
  return NextResponse.json({ qr: dataUrl, url: target });
}
