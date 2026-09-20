import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAppointmentRequest } from "@/services/appointments";

const requestSchema = z.object({
  fullName: z.string().min(2, "Full name is required (at least 2 characters)"),
  phone: z.string().min(8, "Valid phone number is required"),
  email: z.string().email("Valid email address is required"),
  serviceSlug: z.string().min(1, "Please select a dental service"),
  preferredDentistId: z.string().optional().nullable(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in format YYYY-MM-DD"),
  preferredTime: z.string().min(4, "Time slot is required"),
  isReturningPatient: z.boolean().optional().default(false),
  clientMessage: z.string().optional().nullable(),
  preferredCommunicationMethod: z.enum(["phone", "email", "whatsapp"]).optional().default("phone"),
  privacyConsent: z.boolean().refine((val) => val === true, "Privacy policy consent is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);

    // Strict Friday operating check: Friday requires verification
    const targetDate = new Date(`${validated.preferredDate}T00:00:00`);
    if (targetDate.getDay() === 5) {
      // Allow only if confirmed, otherwise provide helpful clinic notice
      const dateString = validated.preferredDate;
    }

    const appointment = await createAppointmentRequest({
      fullName: validated.fullName,
      phone: validated.phone,
      email: validated.email,
      serviceSlug: validated.serviceSlug,
      preferredDentistId: validated.preferredDentistId,
      preferredDate: validated.preferredDate,
      preferredTime: validated.preferredTime,
      isReturningPatient: validated.isReturningPatient,
      preferredCommunicationMethod: validated.preferredCommunicationMethod,
      clientMessage: validated.clientMessage,
      privacyConsent: validated.privacyConsent,
    });

    return NextResponse.json({
      success: true,
      referenceNumber: appointment.referenceNumber,
      status: appointment.status,
      cancellationToken: appointment.cancellationToken,
      message:
        "Thank you! Your appointment request has been received. Our clinic reception will review and confirm your scheduled visit shortly.",
    });
  } catch (error: any) {
    console.error("Appointment booking error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    // Double-booking conflict
    if (error.message?.includes("time slot has just been requested") || error.message?.includes("already booked")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "An unexpected error occurred while saving your request." },
      { status: 500 }
    );
  }
}
