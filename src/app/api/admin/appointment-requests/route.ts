import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireStaff();

    let whereClause: any = {};

    // Strict dentist isolation: Dentists only view their assigned appointments
    if (session.role === "DENTIST") {
      const dentistProfile = await prisma.dentistProfile.findUnique({
        where: { userId: session.userId },
      });
      if (dentistProfile) {
        whereClause.assignedDentistId = dentistProfile.id;
      }
    }

    const appointments = await prisma.appointmentRequest.findMany({
      where: whereClause,
      include: {
        client: true,
        service: true,
        assignedDentist: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch appointment requests" },
      { status: 500 }
    );
  }
}
