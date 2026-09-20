import { NextRequest, NextResponse } from "next/server";
import { authenticateStaff, createSessionToken } from "@/services/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const authResult = await authenticateStaff(email, password);

    if (!authResult.success || !authResult.session) {
      return NextResponse.json(
        { error: authResult.error || "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createSessionToken(authResult.session);

    const response = NextResponse.json({
      success: true,
      user: {
        id: authResult.session.userId,
        email: authResult.session.email,
        role: authResult.session.role,
        name: `${authResult.session.firstName} ${authResult.session.lastName}`,
      },
    });

    // Set secure HttpOnly cookie
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
    console.error("Staff login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during sign-in" },
      { status: 500 }
    );
  }
}
