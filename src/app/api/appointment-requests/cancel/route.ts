import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { AppointmentStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { referenceNumber, reason } = await req.json();

    if (!referenceNumber) {
      return NextResponse.json(
        { error: "Reference number is required" },
        { status: 400 }
      );
    }

    let appointment: { id: string } | null = null;
    try {
      appointment = await prisma.appointmentRequest.findUnique({
        where: { referenceNumber },
      });
    } catch {
      const { data } = await supabaseAdmin
        .from("appointment_requests")
        .select("id")
        .eq("reference_number", referenceNumber)
        .maybeSingle();
      if (data) {
        appointment = { id: data.id };
      }
    }

    if (!appointment) {
      return NextResponse.json(
        { error: "No appointment found with this reference number. Please verify and try again." },
        { status: 404 }
      );
    }

    const cancelReason = reason || "Cancelled by patient via guest cancellation portal";

    try {
      await prisma.appointmentRequest.update({
        where: { id: appointment.id },
        data: {
          status: AppointmentStatus.CANCELLED,
          cancellationReason: cancelReason,
        },
      });
    } catch {
      await supabaseAdmin
        .from("appointment_requests")
        .update({
          status: "CANCELLED",
          cancellation_reason: cancelReason,
        })
        .eq("id", appointment.id);
    }

    return NextResponse.json({
      success: true,
      message: `Appointment request ${referenceNumber} has been marked as cancelled. Our team has been notified.`,
    });
  } catch (error) {
    console.error("Cancellation API error:", error);
    return NextResponse.json(
      { error: "Unable to process cancellation request. Please contact the clinic." },
      { status: 500 }
    );
  }
}
