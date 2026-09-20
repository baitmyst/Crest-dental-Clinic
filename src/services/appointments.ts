import crypto from "crypto";
import { supabase, supabaseAdmin } from "./supabase";
import { AppointmentRequest, AppointmentStatus } from "@/types/database";
import { generateReferenceNumber } from "@/lib/utils";

export interface CreateAppointmentInput {
  fullName: string;
  phone: string;
  email: string;
  serviceSlug: string;
  preferredDentistId?: string | null;
  preferredDate: string; // YYYY-MM-DD
  preferredTime: string; // HH:mm
  isReturningPatient?: boolean;
  preferredCommunicationMethod?: "phone" | "email" | "whatsapp";
  clientMessage?: string | null;
  privacyConsent: boolean;
}

/**
 * Creates an appointment request in Supabase with strict double-booking protection.
 */
export async function createAppointmentRequest(input: CreateAppointmentInput) {
  // 1. Double-booking check: verify slot is not already reserved
  const { data: existingSlot, error: slotErr } = await supabaseAdmin
    .from("appointment_requests")
    .select("id, status")
    .eq("preferred_date", input.preferredDate)
    .eq("preferred_time", input.preferredTime)
    .in("status", ["PENDING", "CONFIRMED", "IN_PROGRESS"])
    .maybeSingle();

  if (slotErr) {
    console.error("Double booking check error:", slotErr);
  }

  if (existingSlot) {
    throw new Error(
      "The selected appointment time slot has just been requested or booked by another patient. Please choose another convenient time."
    );
  }

  // 2. Resolve service ID
  let serviceId = "srv-general";
  let serviceName = "General Dentistry & Check-Ups";

  const { data: supaService } = await supabaseAdmin
    .from("services")
    .select("id, name")
    .or(`slug.eq.${input.serviceSlug},id.eq.${input.serviceSlug}`)
    .maybeSingle();

  if (supaService) {
    serviceId = supaService.id;
    serviceName = supaService.name;
  }

  // 3. Upsert client record in Supabase
  let clientId = "";
  const { data: existingClient } = await supabaseAdmin
    .from("clients")
    .select("id")
    .or(`email.eq.${input.email},phone.eq.${input.phone}`)
    .maybeSingle();

  if (existingClient?.id) {
    clientId = existingClient.id;
    await supabaseAdmin
      .from("clients")
      .update({
        full_name: input.fullName,
        preferred_communication_method: input.preferredCommunicationMethod || "phone",
        is_returning_patient: input.isReturningPatient ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId);
  } else {
    const { data: newClient, error: clientErr } = await supabaseAdmin
      .from("clients")
      .insert({
        full_name: input.fullName,
        phone: input.phone,
        email: input.email,
        is_returning_patient: input.isReturningPatient ?? false,
        preferred_communication_method: input.preferredCommunicationMethod || "phone",
      })
      .select("id")
      .single();

    if (clientErr || !newClient) {
      console.error("Client creation error:", clientErr);
      throw new Error("Unable to register patient record. Please check your contact information.");
    }
    clientId = newClient.id;
  }

  // 4. Generate unique reference number and cancellation token
  let referenceNumber = generateReferenceNumber();
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 5) {
    attempts++;
    const { data: existingRef } = await supabaseAdmin
      .from("appointment_requests")
      .select("id")
      .eq("reference_number", referenceNumber)
      .maybeSingle();

    if (!existingRef) {
      isUnique = true;
    } else {
      referenceNumber = generateReferenceNumber();
    }
  }

  const cancellationToken = crypto.randomBytes(24).toString("hex");
  const cancellationTokenExpiresAt = new Date();
  cancellationTokenExpiresAt.setDate(cancellationTokenExpiresAt.getDate() + 30);

  // 5. Insert appointment request into Supabase
  const { data: newAppt, error: apptErr } = await supabaseAdmin
    .from("appointment_requests")
    .insert({
      reference_number: referenceNumber,
      client_id: clientId,
      service_id: serviceId,
      preferred_dentist_id: input.preferredDentistId || null,
      location_id: "loc-kampala-main",
      preferred_date: input.preferredDate,
      preferred_time: input.preferredTime,
      status: "PENDING",
      source: "WEBSITE",
      client_message: input.clientMessage || null,
      cancellation_token: cancellationToken,
      cancellation_token_expires_at: cancellationTokenExpiresAt.toISOString(),
    })
    .select("id, reference_number, status, preferred_date, preferred_time")
    .single();

  if (apptErr || !newAppt) {
    console.error("Appointment creation error:", apptErr);
    throw new Error("Failed to persist appointment request to database.");
  }

  // 6. Non-blocking staff notification
  try {
    await supabaseAdmin.from("notifications").insert({
      client_id: clientId,
      appointment_request_id: newAppt.id,
      recipient: "admin@crestdentalsurgery.com",
      channel: "EMAIL",
      type: "NEW_APPOINTMENT_REQUEST_ALERT",
      subject: `New Appointment Request: ${referenceNumber} (${input.fullName})`,
      body: `A new appointment request has been submitted for ${serviceName} on ${input.preferredDate} at ${input.preferredTime}. Client: ${input.fullName} (${input.phone}). Status: PENDING review.`,
    });
  } catch {
    // Non-blocking
  }

  return {
    id: newAppt.id,
    referenceNumber: newAppt.reference_number,
    status: newAppt.status as AppointmentStatus,
    preferredDate: newAppt.preferred_date,
    preferredTime: newAppt.preferred_time,
    cancellationToken,
  };
}

/**
 * Retrieves all appointments for the staff panel with relational details.
 */
export async function getAppointments(filters?: {
  status?: string;
  assignedDentistId?: string;
  date?: string;
}) {
  let query = supabaseAdmin
    .from("appointment_requests")
    .select(
      `
      *,
      client:clients(*),
      service:services(*),
      assignedDentist:dentist_profiles!appointment_requests_assigned_dentist_id_fkey(*, user:users(*))
    `
    )
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "ALL") {
    query = query.eq("status", filters.status);
  }

  if (filters?.assignedDentistId) {
    query = query.eq("assigned_dentist_id", filters.assignedDentistId);
  }

  if (filters?.date) {
    query = query.eq("preferred_date", filters.date);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching appointments from Supabase:", error);
    throw error;
  }

  return (data || []).map((a: any) => ({
    id: a.id,
    referenceNumber: a.reference_number,
    preferredDate: a.preferred_date,
    preferredTime: a.preferred_time,
    status: a.status as AppointmentStatus,
    source: a.source,
    clientMessage: a.client_message,
    internalNote: a.internal_note,
    createdAt: a.created_at,
    client: a.client
      ? {
          id: a.client.id,
          fullName: a.client.full_name,
          phone: a.client.phone,
          email: a.client.email,
        }
      : { id: "unknown", fullName: "Unknown Patient", phone: "", email: "" },
    service: a.service
      ? {
          id: a.service.id,
          name: a.service.name,
        }
      : { id: "unknown", name: "Dental Consultation" },
    assignedDentist: a.assignedDentist
      ? {
          id: a.assignedDentist.id,
          user: {
            firstName: a.assignedDentist.user?.first_name || "Dr.",
            lastName: a.assignedDentist.user?.last_name || "Silver",
          },
        }
      : null,
  }));
}

/**
 * Looks up appointment status by patient reference number.
 */
export async function getAppointmentByReference(referenceNumber: string) {
  const { data, error } = await supabaseAdmin
    .from("appointment_requests")
    .select(
      `
      id,
      reference_number,
      preferred_date,
      preferred_time,
      status,
      created_at,
      service:services(name),
      client:clients(full_name, phone)
    `
    )
    .eq("reference_number", referenceNumber.trim().toUpperCase())
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    referenceNumber: data.reference_number,
    preferredDate: data.preferred_date,
    preferredTime: data.preferred_time,
    status: data.status,
    serviceName: (data.service as any)?.name || "Dental Care",
    clientName: (data.client as any)?.full_name || "Patient",
    createdAt: data.created_at,
  };
}

/**
 * Updates appointment status, internal notes, or assigned staff.
 */
export async function updateAppointment(
  id: string,
  updateData: {
    status?: AppointmentStatus;
    internalNote?: string;
    assignedDentistId?: string | null;
  }
) {
  const payload: any = {
    updated_at: new Date().toISOString(),
  };

  if (updateData.status) payload.status = updateData.status;
  if (updateData.internalNote !== undefined) payload.internal_note = updateData.internalNote;
  if (updateData.assignedDentistId !== undefined)
    payload.assigned_dentist_id = updateData.assignedDentistId;

  const { data, error } = await supabaseAdmin
    .from("appointment_requests")
    .update(payload)
    .eq("id", id)
    .select("id, reference_number, status, internal_note")
    .single();

  if (error) {
    console.error("Error updating appointment in Supabase:", error);
    throw error;
  }

  return data;
}

/**
 * Cancels an appointment via client portal or reference number.
 */
export async function cancelAppointment(referenceNumber: string, reason?: string) {
  const cleanRef = referenceNumber.trim().toUpperCase();

  const { data: existing, error: findErr } = await supabaseAdmin
    .from("appointment_requests")
    .select("id, status")
    .eq("reference_number", cleanRef)
    .maybeSingle();

  if (findErr || !existing) {
    throw new Error("No appointment found matching this reference number.");
  }

  if (existing.status === "CANCELLED") {
    return { success: true, message: `Appointment ${cleanRef} is already cancelled.` };
  }

  const { error: updateErr } = await supabaseAdmin
    .from("appointment_requests")
    .update({
      status: "CANCELLED",
      cancellation_reason: reason || "Cancelled by patient via guest portal",
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id);

  if (updateErr) {
    throw new Error("Failed to cancel appointment in database.");
  }

  return {
    success: true,
    message: `Appointment request ${cleanRef} has been successfully cancelled.`,
  };
}
