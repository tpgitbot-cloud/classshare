import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "@/db/schema";

const JWT_SECRET = process.env.JWT_SECRET || "classshare_super_secret_key_2024_production";
const JWT_EXPIRES_IN = "7d";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export function generateToken(admin: { id: string; role: string; email: string }): string {
  return jwt.sign(
    {
      id: admin.id,
      role: admin.role,
      email: admin.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): { id: string; role: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch {
    return null;
  }
}

export function getTokenFromHeader(authHeader?: string | null): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0] === "Bearer") {
    return parts[1];
  }
  return null;
}

export function isSuperAdmin(role: string): boolean {
  return role === "super_admin";
}
