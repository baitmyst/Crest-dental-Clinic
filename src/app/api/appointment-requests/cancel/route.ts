import { NextRequest, NextResponse } from "next/server";
import { cancelAppointment } from "@/services/appointments";

export async function POST(req: NextRequest) {
  try {
    const { referenceNumber, reason } = await req.json();

    if (!referenceNumber) {
      return NextResponse.json(
        { error: "Reference number is required" },
        { status: 400 }
      );
    }

    const result = await cancelAppointment(referenceNumber, reason);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Cancellation API error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to process cancellation request. Please contact the clinic." },
      { status: 400 }
    );
  }
}
