import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/services/auth";
import { getAppointments } from "@/services/appointments";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireStaff();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const date = searchParams.get("date") || undefined;

    let assignedDentistId: string | undefined = undefined;

    // Strict dentist isolation: Dentists view their assigned appointments
    if (session.role === "DENTIST") {
      assignedDentistId = session.userId;
    }

    const appointments = await getAppointments({
      status,
      assignedDentistId,
      date,
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    console.error("Staff get appointments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment requests" },
      { status: 500 }
    );
  }
}
