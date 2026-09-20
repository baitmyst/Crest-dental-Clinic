import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { supabase, supabaseAdmin } from "./supabase";
import { StaffRole } from "@/types/database";

const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "crest-dental-secret-key-2026-uganda-kampala-production-grade"
);

export interface StaffSession {
  userId: string;
  email: string;
  role: StaffRole;
  firstName: string;
  lastName: string;
}

/**
 * Creates a signed JWT session token for staff members.
 */
export async function createSessionToken(payload: StaffSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(AUTH_SECRET);
}

/**
 * Verifies a JWT session token.
 */
export async function verifySessionToken(token: string): Promise<StaffSession | null> {
  try {
    const { payload } = await jwtVerify(token, AUTH_SECRET);
    return payload as unknown as StaffSession;
  } catch {
    return null;
  }
}

/**
 * Authenticates staff with Supabase Auth.
 */
export async function authenticateStaff(
  email: string,
  password: string
): Promise<{ success: boolean; session?: StaffSession; error?: string }> {
  try {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || "Invalid email or password" };
    }

    const authUser = authData.user;
    const meta = authUser.user_metadata || {};

    let role: StaffRole = (meta.role as StaffRole) || "STAFF";
    let firstName = meta.first_name || "Staff";
    let lastName = meta.last_name || "Member";

    // 2. Check profile or users record for updated details
    const { data: userProfile } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (userProfile) {
      role = (userProfile.role as StaffRole) || role;
      firstName = userProfile.first_name || firstName;
      lastName = userProfile.last_name || lastName;
    }

    const session: StaffSession = {
      userId: authUser.id,
      email: authUser.email || cleanEmail,
      role,
      firstName,
      lastName,
    };

    // 3. Record staff login in audit logs
    try {
      await supabaseAdmin.from("audit_logs").insert({
        actor_id: authUser.id,
        action: "STAFF_LOGIN",
        entity_type: "User",
        entity_id: authUser.id,
        metadata_json: JSON.stringify({ email: cleanEmail, role }),
      });
    } catch {
      // Non-blocking
    }

    return { success: true, session };
  } catch (err: any) {
    console.error("Authentication error:", err);
    return { success: false, error: err.message || "Sign-in failed" };
  }
}

/**
 * Retrieves the currently active staff session from cookies.
 */
export async function getStaffSession(): Promise<StaffSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("staff_session")?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Route guard: requires an authenticated staff member.
 */
export async function requireStaff(): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * Route guard: requires an administrator.
 */
export async function requireAdmin(): Promise<StaffSession> {
  const session = await requireStaff();
  if (session.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return session;
}
