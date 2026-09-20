import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { getAppointments } from "@/lib/admin-data";

export async function GET(req: NextRequest) {
  try {
    const session = await requireStaff();

    let whereClause: any = {};

    // Strict dentist isolation: Dentists only view their assigned appointments
    if (session.role === "DENTIST") {
      whereClause.assignedDentistId = session.userId;
    }

    const appointments = await getAppointments(whereClause);

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
