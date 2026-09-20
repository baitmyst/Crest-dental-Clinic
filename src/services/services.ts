import { supabase, supabaseAdmin } from "./supabase";
import { Service } from "@/types/database";

/**
 * Retrieves all active dental services from Supabase.
 */
export async function getActiveServices(): Promise<Service[]> {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching active services:", error);
      return [];
    }

    return (data as Service[]) || [];
  } catch (err) {
    console.error("Exception fetching active services:", err);
    return [];
  }
}

/**
 * Retrieves a dental service by slug from Supabase.
 */
export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as Service;
  } catch (err) {
    console.error(`Exception fetching service ${slug}:`, err);
    return null;
  }
}

/**
 * Admin: List all services (active and inactive).
 */
export async function getAllServices(): Promise<Service[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data as Service[]) || [];
  } catch (err) {
    console.error("Exception fetching all services:", err);
    return [];
  }
}
