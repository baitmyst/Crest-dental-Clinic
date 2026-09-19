import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { generateReferenceNumber } from "@/lib/utils";
import { AppointmentStatus, BookingSource, NotificationChannel } from "@prisma/client";

const requestSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(8, "Valid phone number is required"),
  email: z.string().email("Valid email address is required"),
  serviceSlug: z.string().min(1, "Please select a service"),
  preferredDentistId: z.string().optional().nullable(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  preferredTime: z.string().min(4, "Time slot is required"),
  isReturningPatient: z.boolean().optional().default(false),
  clientMessage: z.string().optional().nullable(),
  preferredCommunicationMethod: z.string().optional().default("phone"),
  privacyConsent: z.boolean().refine((val) => val === true, "Privacy policy consent is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);

    // Strict Friday Check: Prevent booking if Friday is selected while unverified
    const targetDate = new Date(`${validated.preferredDate}T00:00:00`);
    if (targetDate.getDay() === 5) {
      const fridayHours = await prisma.workingHours.findFirst({
        where: { dayOfWeek: 5 },
      });
      if (!fridayHours || !fridayHours.isVerified || !fridayHours.isAvailable) {
        return NextResponse.json(
          {
            error:
              "Friday clinic operating hours are currently awaiting administrative confirmation. Please call +256 773 003214 for Friday requests.",
          },
          { status: 400 }
        );
      }
    }

    // Resolve service
    let service = await prisma.service.findUnique({
      where: { slug: validated.serviceSlug },
    });

    if (!service) {
      // If user selected "I am not sure / I would like advice"
      service = await prisma.service.findFirst({
        where: { slug: "general-dentistry-checkups" },
      });
    }

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Resolve clinic location
    const location = await prisma.clinicLocation.findFirst();
    if (!location) {
      return NextResponse.json({ error: "Clinic location unavailable" }, { status: 500 });
    }

    // Safe duplicate-detection logic for Client record (never create a user/public account!)
    let client = await prisma.client.findFirst({
      where: {
        OR: [{ email: validated.email }, { phone: validated.phone }],
      },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          fullName: validated.fullName,
          phone: validated.phone,
          email: validated.email,
          isReturningPatient: validated.isReturningPatient,
          preferredCommunicationMethod: validated.preferredCommunicationMethod,
          consentPrivacyAt: new Date(),
        },
      });
    } else {
      // Update communication preferences safely
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          fullName: validated.fullName,
          preferredCommunicationMethod: validated.preferredCommunicationMethod,
          isReturningPatient: validated.isReturningPatient,
        },
      });
    }

    // Generate unique human-readable reference number
    let referenceNumber = generateReferenceNumber();
    let existingRef = await prisma.appointmentRequest.findUnique({
      where: { referenceNumber },
    });
    while (existingRef) {
      referenceNumber = generateReferenceNumber();
      existingRef = await prisma.appointmentRequest.findUnique({
        where: { referenceNumber },
      });
    }

    // Generate cancellation token for optional signed guest cancellation requests
    const cancellationToken = crypto.randomBytes(24).toString("hex");
    const cancellationTokenExpiresAt = new Date();
    cancellationTokenExpiresAt.setDate(cancellationTokenExpiresAt.getDate() + 30); // 30-day token

    // Save AppointmentRequest record with PENDING status inside transaction
    const appointment = await prisma.$transaction(async (tx) => {
      return await tx.appointmentRequest.create({
        data: {
          referenceNumber,
          clientId: client.id,
          serviceId: service.id,
          preferredDentistId: validated.preferredDentistId || null,
          locationId: location.id,
          preferredDate: validated.preferredDate,
          preferredTime: validated.preferredTime,
          status: AppointmentStatus.PENDING,
          source: BookingSource.WEBSITE,
          clientMessage: validated.clientMessage || null,
          cancellationToken,
          cancellationTokenExpiresAt,
        },
      });
    });

    // Record system notification for clinic staff
    await prisma.notification.create({
      data: {
        clientId: client.id,
        appointmentRequestId: appointment.id,
        recipient: "admin@crestdentalsurgery.com",
        channel: NotificationChannel.EMAIL,
        type: "NEW_APPOINTMENT_REQUEST_ALERT",
        subject: `New Appointment Request: ${referenceNumber} (${validated.fullName})`,
        body: `A new appointment request has been submitted for ${service.name} on ${validated.preferredDate} at ${validated.preferredTime}. Client Phone: ${validated.phone}. Status: PENDING review.`,
      },
    });

    return NextResponse.json({
      success: true,
      referenceNumber: appointment.referenceNumber,
      status: appointment.status,
      cancellationToken,
      message:
        "Thank you. Your appointment request has been received. The Dr. Dental Crest Dental Surgery team will contact you shortly to confirm a convenient appointment time.",
    });
  } catch (error: any) {
    console.error("Appointment request creation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred while saving your request." },
      { status: 500 }
    );
  }
}
