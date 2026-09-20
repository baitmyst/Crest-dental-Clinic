import { NextRequest, NextResponse } from "next/server";
import { getAppointmentByReference } from "@/services/appointments";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref") || searchParams.get("referenceNumber");

    if (!ref) {
      return NextResponse.json(
        { error: "Appointment reference number is required" },
        { status: 400 }
      );
    }

    const appointment = await getAppointmentByReference(ref);

    if (!appointment) {
      return NextResponse.json(
        { error: "No appointment found with reference number " + ref },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, appointment });
  } catch (error: any) {
    console.error("Status lookup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while looking up your appointment" },
      { status: 500 }
    );
  }
}
