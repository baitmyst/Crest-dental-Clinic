import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let user: {
      id: string;
      email: string;
      passwordHash: string;
      firstName: string;
      lastName: string;
      role: Role;
      isActive: boolean;
    } | null = null;

    // 1. Try Prisma first
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          passwordHash: dbUser.passwordHash,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          role: dbUser.role as Role,
          isActive: dbUser.isActive,
        };
      }
    } catch (prismaErr) {
      console.warn("Prisma user lookup error, falling back to Supabase client:", prismaErr);
    }

    // 2. Fallback to Supabase client if Prisma was unavailable or didn't find the user
    if (!user) {
      try {
        const { data: supaUser, error: supaErr } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (supaUser && !supaErr) {
          user = {
            id: supaUser.id,
            email: supaUser.email,
            passwordHash: supaUser.password_hash,
            firstName: supaUser.first_name,
            lastName: supaUser.last_name,
            role: supaUser.role as Role,
            isActive: supaUser.is_active,
          };
        }
      } catch (supaEx) {
        console.warn("Supabase user lookup exception:", supaEx);
      }
    }

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Invalid email credentials or inactive account" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session JWT token
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Record audit log safely without blocking login on failure
    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "STAFF_LOGIN",
          entityType: "User",
          entityId: user.id,
          metadataJson: JSON.stringify({ email: user.email, role: user.role }),
        },
      });
    } catch (auditErr) {
      console.warn("Prisma audit log recording skipped:", auditErr);
      try {
        await supabaseAdmin.from("audit_logs").insert({
          actor_id: user.id,
          action: "STAFF_LOGIN",
          entity_type: "User",
          entity_id: user.id,
          metadata_json: JSON.stringify({ email: user.email, role: user.role }),
        });
      } catch {
        // Non-blocking
      }
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`,
      },
    });

    // Set HttpOnly cookie
    response.cookies.set({
      name: "staff_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during sign-in" },
      { status: 500 }
    );
  }
}
