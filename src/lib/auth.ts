import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "crest-dental-secret-key-2026-uganda-kampala-production-grade"
);

export interface StaffSession {
  userId: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
}

export async function createSessionToken(payload: StaffSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<StaffSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as StaffSession;
  } catch {
    return null;
  }
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("staff_session")?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function requireStaff(): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireAdmin(): Promise<StaffSession> {
  const session = await requireStaff();
  if (session.role !== Role.ADMIN) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
