import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { AppointmentStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireStaff();
    const { id } = await params;
    const body = await req.json();

    const { status, internalNote, assignedDentistId, preferredDate, preferredTime } = body;

    const existing = await prisma.appointmentRequest.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Role check: If DENTIST, ensure this appointment is assigned to them
    if (session.role === "DENTIST") {
      const dentistProfile = await prisma.dentistProfile.findUnique({
        where: { userId: session.userId },
      });
      if (existing.assignedDentistId !== dentistProfile?.id) {
        return NextResponse.json(
          { error: "Dentists can only manage their assigned appointments" },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.appointmentRequest.update({
      where: { id },
      data: {
        status: status ? (status as AppointmentStatus) : undefined,
        internalNote: internalNote !== undefined ? internalNote : undefined,
        assignedDentistId: assignedDentistId !== undefined ? assignedDentistId : undefined,
        preferredDate: preferredDate !== undefined ? preferredDate : undefined,
        preferredTime: preferredTime !== undefined ? preferredTime : undefined,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: `APPOINTMENT_UPDATED_${status || "MODIFIED"}`,
        entityType: "AppointmentRequest",
        entityId: id,
        metadataJson: JSON.stringify({
          reference: existing.referenceNumber,
          oldStatus: existing.status,
          newStatus: status || existing.status,
        }),
      },
    });

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
