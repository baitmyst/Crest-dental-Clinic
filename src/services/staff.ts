import { supabaseAdmin } from "./supabase";
import { DentistProfile } from "@/types/database";

/**
 * Retrieves bookable dentists from Supabase with user relations.
 */
export async function getDentists(): Promise<DentistProfile[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("dentist_profiles")
      .select(`
        *,
        user:users(*)
      `)
      .eq("is_bookable", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching dentists:", error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      user_id: d.user_id,
      professional_title: d.professional_title,
      specialties: d.specialties,
      qualifications: d.qualifications,
      biography: d.biography,
      languages: d.languages,
      years_experience: d.years_experience,
      display_order: d.display_order,
      is_bookable: d.is_bookable,
      created_at: d.created_at,
      updated_at: d.updated_at,
      user: d.user
        ? {
            id: d.user.id,
            first_name: d.user.first_name,
            last_name: d.user.last_name,
            email: d.user.email,
            phone: d.user.phone,
            image_url: d.user.image_url,
          }
        : undefined,
    }));
  } catch (err) {
    console.error("Exception fetching dentists:", err);
    return [];
  }
}

/**
 * Retrieves all staff members for administration.
 */
export async function getStaffUsers() {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, first_name, last_name, email, phone, role, is_active, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}
