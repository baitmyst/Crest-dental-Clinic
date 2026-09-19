import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const appointment = await prisma.appointmentRequest.findUnique({
      where: { referenceNumber },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "No appointment found with this reference number. Please verify and try again." },
        { status: 404 }
      );
    }

    await prisma.appointmentRequest.update({
      where: { id: appointment.id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancellationReason: reason || "Cancelled by patient via guest cancellation portal",
      },
    });

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
