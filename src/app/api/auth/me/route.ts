import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/middleware";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { admin } = auth;
  return NextResponse.json({
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      username: admin.username,
      role: admin.role,
      status: admin.status,
      lastLogin: admin.lastLogin,
    },
  });
}
