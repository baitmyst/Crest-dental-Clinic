import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlotsForDate } from "@/lib/availability";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const serviceId = searchParams.get("serviceId") || undefined;
    const dentistId = searchParams.get("dentistId") || undefined;

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const result = await getAvailableSlotsForDate(date, serviceId, dentistId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Availability API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate availability" },
      { status: 500 }
    );
  }
}
