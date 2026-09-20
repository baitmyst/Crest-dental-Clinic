import { NextResponse } from "next/server";
import { getActiveServices } from "@/services/services";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const services = await getActiveServices();
    return NextResponse.json({ services });
  } catch (error) {
    console.error("API get services error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve dental services" },
      { status: 500 }
    );
  }
}
