import { supabaseAdmin } from "./supabase";
import { Client } from "@/types/database";

/**
 * Retrieves all patients / clients with appointment counts from Supabase.
 */
export async function getClients(searchQuery?: string) {
  let query = supabaseAdmin
    .from("clients")
    .select(`
      *,
      appointments:appointment_requests(id, reference_number, preferred_date, preferred_time, status)
    `)
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.or(
      `full_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching clients from Supabase:", error);
    throw error;
  }

  return (data || []).map((c: any) => ({
    id: c.id,
    fullName: c.full_name,
    phone: c.phone,
    email: c.email,
    dateOfBirth: c.date_of_birth,
    isReturningPatient: c.is_returning_patient,
    preferredCommunicationMethod: c.preferred_communication_method,
    createdAt: c.created_at,
    totalAppointments: (c.appointments || []).length,
    appointments: c.appointments || [],
  }));
}
