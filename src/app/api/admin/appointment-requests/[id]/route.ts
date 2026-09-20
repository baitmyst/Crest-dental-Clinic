import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/services/auth";
import { supabaseAdmin } from "@/services/supabase";
import { AppointmentStatus } from "@/types/database";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireStaff();
    const { id } = await params;
    const body = await req.json();

    const { status, internalNote, assignedDentistId, preferredDate, preferredTime } = body;

    const { data: existing, error: findErr } = await supabaseAdmin
      .from("appointment_requests")
      .select("id, reference_number, status, assigned_dentist_id")
      .eq("id", id)
      .maybeSingle();

    if (findErr || !existing) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Role check: If DENTIST, ensure this appointment is assigned to them
    if (session.role === "DENTIST") {
      const { data: dentistProfile } = await supabaseAdmin
        .from("dentist_profiles")
        .select("id")
        .eq("user_id", session.userId)
        .maybeSingle();

      if (dentistProfile && existing.assigned_dentist_id !== dentistProfile.id) {
        return NextResponse.json(
          { error: "Dentists can only manage their assigned appointments" },
          { status: 403 }
        );
      }
    }

    const payload: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) payload.status = status;
    if (internalNote !== undefined) payload.internal_note = internalNote;
    if (assignedDentistId !== undefined) payload.assigned_dentist_id = assignedDentistId;
    if (preferredDate !== undefined) payload.preferred_date = preferredDate;
    if (preferredTime !== undefined) payload.preferred_time = preferredTime;

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("appointment_requests")
      .update(payload)
      .eq("id", id)
      .select("id, reference_number, status, internal_note, preferred_date, preferred_time")
      .single();

    if (updateErr) {
      console.error("Supabase appointment update error:", updateErr);
      return NextResponse.json({ error: "Failed to update appointment in database" }, { status: 500 });
    }

    // Record audit log
    try {
      await supabaseAdmin.from("audit_logs").insert({
        actor_id: session.userId,
        action: `APPOINTMENT_UPDATED_${status || "MODIFIED"}`,
        entity_type: "AppointmentRequest",
        entity_id: id,
        metadata_json: JSON.stringify({
          reference: existing.reference_number,
          oldStatus: existing.status,
          newStatus: status || existing.status,
          updatedBy: session.email,
        }),
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error: any) {
    console.error("Update appointment error:", error);
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update appointment record" },
      { status: 500 }
    );
  }
}
