import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/services/auth";
import { supabaseAdmin } from "@/services/supabase";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { isVerified, startTime, endTime } = await req.json();

    const { data: friday, error: findErr } = await supabaseAdmin
      .from("working_hours")
      .select("*")
      .eq("day_of_week", 5)
      .maybeSingle();

    if (findErr || !friday) {
      return NextResponse.json({ error: "Friday schedule not found" }, { status: 404 });
    }

    const payload: any = {
      is_verified: isVerified !== undefined ? isVerified : true,
      is_available: isVerified !== undefined ? isVerified : true,
      updated_at: new Date().toISOString(),
    };

    if (startTime) payload.start_time = startTime;
    if (endTime) payload.end_time = endTime;

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("working_hours")
      .update(payload)
      .eq("id", friday.id)
      .select("*")
      .single();

    if (updateErr) {
      return NextResponse.json({ error: "Failed to update Friday hours in Supabase" }, { status: 500 });
    }

    return NextResponse.json({ success: true, friday: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
