// ==============================================================================
// Crest Dental Clinic — Supabase Database TypeScript Definitions
// ==============================================================================

export type StaffRole = "ADMIN" | "STAFF" | "RECEPTIONIST" | "DENTIST";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type InquiryStatus = "OPEN" | "RESPONDED" | "RESOLVED" | "SPAM";

export interface Profile {
  id: string; // matches auth.users.id (UUID)
  full_name: string;
  phone: string | null;
  email: string;
  role: StaffRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  date_of_birth?: string | null;
  is_returning_patient: boolean;
  preferred_communication_method: "phone" | "email" | "whatsapp";
  consent_privacy_at: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  category: string;
  short_description: string;
  full_description: string;
  benefits: string; // JSON array or formatted string
  treatment_process: string; // JSON array
  faq_content: string; // JSON array
  duration_minutes: number;
  buffer_minutes: number;
  image_url: string | null;
  image_alt_text: string | null;
  is_active: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DentistProfile {
  id: string;
  user_id: string;
  professional_title: string | null;
  specialties: string;
  qualifications: string | null;
  biography: string | null;
  languages: string | null;
  years_experience: number | null;
  display_order: number;
  is_bookable: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    image_url?: string | null;
  };
}

export interface WorkingHours {
  id: string;
  dentist_id: string | null;
  location_id: string;
  day_of_week: number; // 0=Sun, 1=Mon, ..., 6=Sat
  start_time: string; // "08:00"
  end_time: string; // "20:00"
  is_available: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppointmentRequest {
  id: string;
  reference_number: string;
  client_id: string;
  service_id: string;
  preferred_dentist_id: string | null;
  assigned_dentist_id: string | null;
  location_id: string;
  preferred_date: string; // YYYY-MM-DD
  preferred_time: string; // HH:mm
  start_at: string | null;
  end_at: string | null;
  status: AppointmentStatus;
  source: string;
  client_message: string | null;
  internal_note: string | null;
  cancellation_reason: string | null;
  cancellation_token: string | null;
  cancellation_token_expires_at: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  service?: Service;
  assignedDentist?: DentistProfile | null;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  assigned_to_id: string | null;
  internal_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  client_id: string | null;
  appointment_request_id: string | null;
  recipient: string;
  channel: "EMAIL" | "SMS" | "WHATSAPP";
  type: string;
  subject: string | null;
  body: string;
  status: "PENDING" | "SENT" | "FAILED";
  sent_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata_json: string | null;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  clinic_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  contact_email: string | null;
  contact_phone: string;
  whatsapp_number: string | null;
  emergency_phone: string | null;
  location_text: string;
  timezone: string;
  default_seo_title: string;
  default_seo_description: string;
  booking_settings: string | null;
  notification_settings: string | null;
  rating_enabled: boolean;
  rating_value: number;
  rating_label: string;
  updated_at: string;
}
