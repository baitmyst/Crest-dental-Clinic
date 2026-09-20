import { supabaseAdmin } from "./supabase";
import { AppointmentStatus } from "@/types/database";

export interface WalkInPatientInput {
  fullName: string;
  phone: string;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  emergencyContact?: string | null;
  serviceId: string;
  assignedDentistId?: string | null;
  priority: "ROUTINE" | "URGENT" | "EMERGENCY";
  chiefComplaint?: string | null;
  vitals?: {
    bloodPressure?: string;
    temperature?: string;
    notes?: string;
  } | null;
  staffNotes?: string | null;
  status?: AppointmentStatus;
}

export interface WalkInRecord {
  id: string;
  referenceNumber: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  serviceId: string;
  serviceName: string;
  assignedDentistId: string | null;
  assignedDentistName: string | null;
  date: string;
  arrivalTime: string;
  status: AppointmentStatus;
  priority: "ROUTINE" | "URGENT" | "EMERGENCY";
  chiefComplaint: string | null;
  internalNote: string | null;
  createdAt: string;
}

/**
 * Registers a walk-in patient at the clinic reception.
 * Creates/updates the client in CRM and inserts an active appointment request with source='WALK_IN'.
 */
export async function registerWalkInPatient(input: WalkInPatientInput) {
  // 1. Clean inputs
  const cleanedPhone = input.phone.trim();
  const cleanedName = input.fullName.trim();
  const cleanedEmail = input.email?.trim() || `${cleanedPhone.replace(/[^0-9]/g, "")}@walkin.crestdental.local`;

  // 2. Find or create client in the CRM
  let clientId: string | null = null;
  const { data: existingClient } = await supabaseAdmin
    .from("clients")
    .select("id, total_visits")
    .or(`phone.eq.${cleanedPhone},email.eq.${cleanedEmail}`)
    .maybeSingle();

  if (existingClient) {
    clientId = existingClient.id;
    // Increment visit count
    await supabaseAdmin
      .from("clients")
      .update({
        full_name: cleanedName,
        date_of_birth: input.dateOfBirth || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId);
  } else {
    const { data: newClient, error: clientErr } = await supabaseAdmin
      .from("clients")
      .insert({
        full_name: cleanedName,
        phone: cleanedPhone,
        email: cleanedEmail,
        date_of_birth: input.dateOfBirth || null,
        is_returning_patient: false,
        preferred_communication_method: "phone",
        consent_privacy_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (clientErr || !newClient) {
      console.error("Walk-in client creation error:", clientErr);
      throw new Error("Failed to register patient in clinic directory.");
    }
    clientId = newClient.id;
  }

  // 3. Generate Walk-In Reference Code: WI-YYYY-XXXXXX
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const referenceNumber = `WI-${currentYear}-${randomSuffix}`;

  // Current date & time strings
  const now = new Date();
  const todayDate = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().substring(0, 5); // HH:MM

  // Build internal note with triage priority, vitals, and emergency contact
  const noteParts = [`[WALK-IN | Priority: ${input.priority}]`];
  if (input.vitals?.bloodPressure || input.vitals?.temperature) {
    noteParts.push(
      `Vitals: ${input.vitals.bloodPressure ? `BP ${input.vitals.bloodPressure}` : ""} ${
        input.vitals.temperature ? `Temp ${input.vitals.temperature}°C` : ""
      }`.trim()
    );
  }
  if (input.emergencyContact) {
    noteParts.push(`Emerg. Contact: ${input.emergencyContact}`);
  }
  if (input.staffNotes) {
    noteParts.push(`Staff Note: ${input.staffNotes}`);
  }
  const internalNote = noteParts.join(" | ");

  // 4. Create appointment request with source = 'WALK_IN'
  const { data: appt, error: apptErr } = await supabaseAdmin
    .from("appointment_requests")
    .insert({
      reference_number: referenceNumber,
      client_id: clientId,
      service_id: input.serviceId,
      assigned_dentist_id: input.assignedDentistId || null,
      preferred_dentist_id: input.assignedDentistId || null,
      location_id: "loc-kampala-main",
      preferred_date: todayDate,
      preferred_time: currentTime,
      status: input.status || "CONFIRMED", // Confirmed since patient is physically at clinic
      source: "WALK_IN",
      client_message: input.chiefComplaint || "Walk-in patient check-in",
      internal_note: internalNote,
    })
    .select(
      `
      id,
      reference_number,
      preferred_date,
      preferred_time,
      status,
      created_at,
      service:services(id, name),
      client:clients(id, full_name, phone, email),
      assignedDentist:dentist_profiles!appointment_requests_assigned_dentist_id_fkey(
        id,
        professional_title,
        user:users(id, first_name, last_name)
      )
    `
    )
    .single();

  if (apptErr || !appt) {
    console.error("Walk-in appointment insertion error:", apptErr);
    throw new Error("Failed to register walk-in into clinic queue.");
  }

  // 5. Create audit log
  await supabaseAdmin.from("audit_logs").insert({
    action: "WALK_IN_REGISTERED",
    entity: "appointment_requests",
    entity_id: appt.id,
    performed_by: "Reception / Staff",
    metadata: {
      patientName: cleanedName,
      referenceNumber,
      priority: input.priority,
      serviceId: input.serviceId,
    },
  });

  const dentistUser = (appt.assignedDentist as any)?.user;
  const assignedDentistName = dentistUser
    ? `${(appt.assignedDentist as any)?.professional_title || "Dr."} ${dentistUser.first_name || ""} ${dentistUser.last_name || ""}`.trim()
    : null;

  return {
    id: appt.id,
    referenceNumber: appt.reference_number,
    clientId,
    clientName: cleanedName,
    clientPhone: cleanedPhone,
    clientEmail: cleanedEmail,
    serviceId: input.serviceId,
    serviceName: (appt.service as any)?.name || "General Dental Care",
    assignedDentistId: input.assignedDentistId || null,
    assignedDentistName,
    date: appt.preferred_date,
    arrivalTime: appt.preferred_time,
    status: appt.status as AppointmentStatus,
    priority: input.priority,
    chiefComplaint: input.chiefComplaint || null,
    internalNote,
    createdAt: appt.created_at,
  };
}

/**
 * Retrieves all walk-in patients (optionally filtered by date).
 */
export async function getWalkIns(dateFilter?: string): Promise<WalkInRecord[]> {
  let query = supabaseAdmin
    .from("appointment_requests")
    .select(
      `
      id,
      reference_number,
      client_id,
      preferred_date,
      preferred_time,
      status,
      client_message,
      internal_note,
      created_at,
      service:services(id, name),
      client:clients(id, full_name, phone, email),
      assignedDentist:dentist_profiles!appointment_requests_assigned_dentist_id_fkey(
        id,
        professional_title,
        user:users(id, first_name, last_name)
      )
    `
    )
    .eq("source", "WALK_IN")
    .order("created_at", { ascending: false });

  if (dateFilter) {
    query = query.eq("preferred_date", dateFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching walk-ins:", error);
    throw error;
  }

  return (data || []).map((row: any) => {
    // Parse priority from internalNote if formatted
    let priority: "ROUTINE" | "URGENT" | "EMERGENCY" = "ROUTINE";
    if (row.internal_note?.includes("Priority: EMERGENCY")) priority = "EMERGENCY";
    else if (row.internal_note?.includes("Priority: URGENT")) priority = "URGENT";

    const dentistUser = row.assignedDentist?.user;
    const assignedDentistName = dentistUser
      ? `${row.assignedDentist?.professional_title || "Dr."} ${dentistUser.first_name || ""} ${dentistUser.last_name || ""}`.trim()
      : "Unassigned / General Queue";

    return {
      id: row.id,
      referenceNumber: row.reference_number,
      clientId: row.client_id,
      clientName: row.client?.full_name || "Walk-in Patient",
      clientPhone: row.client?.phone || "-",
      clientEmail: row.client?.email?.includes("@walkin.crestdental.local") ? null : row.client?.email,
      serviceId: row.service?.id || "",
      serviceName: row.service?.name || "Dental Service",
      assignedDentistId: row.assignedDentist?.id || null,
      assignedDentistName,
      date: row.preferred_date,
      arrivalTime: row.preferred_time,
      status: row.status,
      priority,
      chiefComplaint: row.client_message,
      internalNote: row.internal_note,
      createdAt: row.created_at,
    };
  });
}

/**
 * Updates a walk-in patient's status (e.g. from CONFIRMED -> COMPLETED or CANCELLED)
 * and optional notes or dentist reassignment.
 */
export async function updateWalkInStatus(
  id: string,
  updates: {
    status?: AppointmentStatus;
    assignedDentistId?: string | null;
    staffNotes?: string;
  }
) {
  const payload: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status) payload.status = updates.status;
  if (updates.assignedDentistId !== undefined) payload.assigned_dentist_id = updates.assignedDentistId;
  if (updates.staffNotes) payload.internal_note = updates.staffNotes;

  const { data, error } = await supabaseAdmin
    .from("appointment_requests")
    .update(payload)
    .eq("id", id)
    .select(
      `
      id,
      reference_number,
      status,
      internal_note,
      assigned_dentist_id
    `
    )
    .single();

  if (error) {
    console.error("Error updating walk-in status:", error);
    throw error;
  }

  return data;
}
