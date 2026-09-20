import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
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
      let isFridayVerified = false;
      try {
        const fridayHours = await prisma.workingHours.findFirst({
          where: { dayOfWeek: 5 },
        });
        isFridayVerified = !!(fridayHours && fridayHours.isVerified && fridayHours.isAvailable);
      } catch {
        const { data: supaFriday } = await supabaseAdmin
          .from("working_hours")
          .select("is_verified, is_available")
          .eq("day_of_week", 5)
          .maybeSingle();
        isFridayVerified = !!(supaFriday && supaFriday.is_verified && supaFriday.is_available);
      }

      if (!isFridayVerified) {
        return NextResponse.json(
          {
            error:
              "Friday clinic operating hours are currently awaiting administrative confirmation. Please call +256 773 003214 for Friday requests.",
          },
          { status: 400 }
        );
      }
    }

    // Try standard Prisma flow first
    try {
      let service = await prisma.service.findUnique({
        where: { slug: validated.serviceSlug },
      });

      if (!service) {
        service = await prisma.service.findFirst({
          where: { slug: "general-dentistry-checkups" },
        });
      }

      if (service) {
        const location = await prisma.clinicLocation.findFirst();
        if (location) {
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
            client = await prisma.client.update({
              where: { id: client.id },
              data: {
                fullName: validated.fullName,
                preferredCommunicationMethod: validated.preferredCommunicationMethod,
                isReturningPatient: validated.isReturningPatient,
              },
            });
          }

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

          const cancellationToken = crypto.randomBytes(24).toString("hex");
          const cancellationTokenExpiresAt = new Date();
          cancellationTokenExpiresAt.setDate(cancellationTokenExpiresAt.getDate() + 30);

          const appointment = await prisma.appointmentRequest.create({
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

          try {
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
          } catch {
            // Non-blocking notification
          }

          return NextResponse.json({
            success: true,
            referenceNumber: appointment.referenceNumber,
            status: appointment.status,
            cancellationToken,
            message:
              "Thank you. Your appointment request has been received. The Dr. Dental Crest Dental Surgery team will contact you shortly to confirm a convenient appointment time.",
          });
        }
      }
    } catch (prismaErr) {
      console.warn("Prisma appointment booking failed, using Supabase fallback:", prismaErr);
    }

    // --- Supabase Fallback Flow ---
    let serviceId = "srv-general";
    let serviceName = "General Dentistry & Check-Ups";
    const { data: supaService } = await supabaseAdmin
      .from("services")
      .select("id, name")
      .or(`slug.eq.${validated.serviceSlug},id.eq.${validated.serviceSlug}`)
      .maybeSingle();

    if (supaService) {
      serviceId = supaService.id;
      serviceName = supaService.name;
    }

    // Find or create client in Supabase
    let clientId = "";
    const { data: existingClient } = await supabaseAdmin
      .from("clients")
      .select("id")
      .or(`email.eq.${validated.email},phone.eq.${validated.phone}`)
      .maybeSingle();

    if (existingClient?.id) {
      clientId = existingClient.id;
      await supabaseAdmin
        .from("clients")
        .update({
          full_name: validated.fullName,
          preferred_communication_method: validated.preferredCommunicationMethod,
          is_returning_patient: validated.isReturningPatient,
        })
        .eq("id", clientId);
    } else {
      const { data: newClient, error: clientErr } = await supabaseAdmin
        .from("clients")
        .insert({
          full_name: validated.fullName,
          phone: validated.phone,
          email: validated.email,
          is_returning_patient: validated.isReturningPatient,
          preferred_communication_method: validated.preferredCommunicationMethod,
        })
        .select("id")
        .single();

      if (clientErr) throw new Error(clientErr.message);
      clientId = newClient.id;
    }

    const referenceNumber = generateReferenceNumber();
    const cancellationToken = crypto.randomBytes(24).toString("hex");
    const cancellationTokenExpiresAt = new Date();
    cancellationTokenExpiresAt.setDate(cancellationTokenExpiresAt.getDate() + 30);

    const { data: appt, error: apptErr } = await supabaseAdmin
      .from("appointment_requests")
      .insert({
        reference_number: referenceNumber,
        client_id: clientId,
        service_id: serviceId,
        preferred_dentist_id: validated.preferredDentistId || null,
        location_id: "loc-kampala-main",
        preferred_date: validated.preferredDate,
        preferred_time: validated.preferredTime,
        status: "PENDING",
        source: "WEBSITE",
        client_message: validated.clientMessage || null,
        cancellation_token: cancellationToken,
        cancellation_token_expires_at: cancellationTokenExpiresAt.toISOString(),
      })
      .select("id, reference_number, status")
      .single();

    if (apptErr) throw new Error(apptErr.message);

    try {
      await supabaseAdmin.from("notifications").insert({
        client_id: clientId,
        appointment_request_id: appt.id,
        recipient: "admin@crestdentalsurgery.com",
        channel: "EMAIL",
        type: "NEW_APPOINTMENT_REQUEST_ALERT",
        subject: `New Appointment Request: ${referenceNumber} (${validated.fullName})`,
        body: `A new appointment request has been submitted for ${serviceName} on ${validated.preferredDate} at ${validated.preferredTime}. Client Phone: ${validated.phone}. Status: PENDING review.`,
      });
    } catch {
      // Non-blocking notification
    }

    return NextResponse.json({
      success: true,
      referenceNumber: appt.reference_number,
      status: appt.status,
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
