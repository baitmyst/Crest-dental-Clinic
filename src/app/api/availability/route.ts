import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlotsForDate } from "@/services/availability";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const serviceSlug = searchParams.get("serviceSlug") || searchParams.get("serviceId") || undefined;
    const dentistId = searchParams.get("dentistId") || undefined;

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const result = await getAvailableSlotsForDate(date, serviceSlug, dentistId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Availability API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate slot availability" },
      { status: 500 }
    );
  }
}
