-- ==============================================================================
-- DR. DENTAL CREST DENTAL SURGERY - PRODUCTION SUPABASE SCHEMA & RLS MIGRATION
-- Clinic Location: Kampala, Uganda | Phone: +256 773 003214
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS "profiles" (
  "id" UUID PRIMARY KEY REFERENCES auth.users("id") ON DELETE CASCADE,
  "full_name" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT UNIQUE NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'STAFF' CHECK (role IN ('ADMIN', 'STAFF', 'RECEPTIONIST', 'DENTIST')),
  "avatar_url" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for role-based lookups
CREATE INDEX IF NOT EXISTS "idx_profiles_role" ON "profiles"("role");
CREATE INDEX IF NOT EXISTS "idx_profiles_email" ON "profiles"("email");

-- 3. CLIENTS (Guest-friendly patient record structure)
CREATE TABLE IF NOT EXISTS "clients" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "full_name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "date_of_birth" TEXT,
  "is_returning_patient" BOOLEAN NOT NULL DEFAULT false,
  "preferred_communication_method" TEXT NOT NULL DEFAULT 'phone',
  "consent_privacy_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_clients_phone" ON "clients"("phone");
CREATE INDEX IF NOT EXISTS "idx_clients_email" ON "clients"("email");

-- 4. SERVICES (Clinic Dental Services)
CREATE TABLE IF NOT EXISTS "services" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "category" TEXT NOT NULL,
  "short_description" TEXT NOT NULL,
  "full_description" TEXT NOT NULL,
  "benefits" TEXT NOT NULL,
  "treatment_process" TEXT NOT NULL,
  "faq_content" TEXT NOT NULL,
  "duration_minutes" INT NOT NULL DEFAULT 45,
  "buffer_minutes" INT NOT NULL DEFAULT 15,
  "image_url" TEXT,
  "image_alt_text" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "seo_title" TEXT,
  "seo_description" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_services_slug" ON "services"("slug");
CREATE INDEX IF NOT EXISTS "idx_services_is_active" ON "services"("is_active");

-- 5. DENTIST PROFILES
CREATE TABLE IF NOT EXISTS "dentist_profiles" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" TEXT UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "professional_title" TEXT,
  "specialties" TEXT NOT NULL DEFAULT 'General Dentistry',
  "qualifications" TEXT,
  "biography" TEXT,
  "languages" TEXT,
  "years_experience" INT,
  "display_order" INT NOT NULL DEFAULT 0,
  "is_bookable" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CLINIC LOCATIONS & WORKING HOURS
CREATE TABLE IF NOT EXISTS "clinic_locations" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL DEFAULT 'Dr. Dental Crest Dental Surgery',
  "address" TEXT,
  "directions_note" TEXT DEFAULT 'Visit our Kampala clinic. Please call us for directions.',
  "phone" TEXT NOT NULL DEFAULT '+256 773 003214',
  "email" TEXT,
  "timezone" TEXT NOT NULL DEFAULT 'Africa/Kampala',
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "map_url" TEXT,
  "is_public_address_verified" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "working_hours" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "dentist_id" TEXT REFERENCES "dentist_profiles"("id") ON DELETE CASCADE,
  "location_id" TEXT NOT NULL REFERENCES "clinic_locations"("id") ON DELETE CASCADE,
  "day_of_week" INT NOT NULL, -- 0=Sun, 1=Mon, ..., 6=Sat
  "start_time" TEXT NOT NULL,
  "end_time" TEXT NOT NULL,
  "is_available" BOOLEAN NOT NULL DEFAULT true,
  "is_verified" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_working_hours_day" ON "working_hours"("day_of_week");

-- 7. APPOINTMENT REQUESTS
CREATE TABLE IF NOT EXISTS "appointment_requests" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "reference_number" TEXT UNIQUE NOT NULL,
  "client_id" TEXT NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "service_id" TEXT NOT NULL REFERENCES "services"("id") ON DELETE RESTRICT,
  "preferred_dentist_id" TEXT REFERENCES "dentist_profiles"("id") ON DELETE SET NULL,
  "assigned_dentist_id" TEXT REFERENCES "dentist_profiles"("id") ON DELETE SET NULL,
  "location_id" TEXT NOT NULL REFERENCES "clinic_locations"("id") ON DELETE RESTRICT,
  "preferred_date" TEXT NOT NULL,
  "preferred_time" TEXT NOT NULL,
  "start_at" TIMESTAMPTZ,
  "end_at" TIMESTAMPTZ,
  "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  "source" TEXT NOT NULL DEFAULT 'WEBSITE',
  "client_message" TEXT,
  "internal_note" TEXT,
  "cancellation_reason" TEXT,
  "cancellation_token" TEXT UNIQUE,
  "cancellation_token_expires_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_appt_reference" ON "appointment_requests"("reference_number");
CREATE INDEX IF NOT EXISTS "idx_appt_date_time" ON "appointment_requests"("preferred_date", "preferred_time");
CREATE INDEX IF NOT EXISTS "idx_appt_status" ON "appointment_requests"("status");
CREATE INDEX IF NOT EXISTS "idx_appt_client" ON "appointment_requests"("client_id");

-- 8. CONTACT INQUIRIES & NOTIFICATIONS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS "contact_inquiries" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESPONDED', 'RESOLVED', 'SPAM')),
  "assigned_to_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "internal_note" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "client_id" TEXT REFERENCES "clients"("id") ON DELETE SET NULL,
  "appointment_request_id" TEXT REFERENCES "appointment_requests"("id") ON DELETE SET NULL,
  "recipient" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT 'EMAIL',
  "type" TEXT NOT NULL,
  "subject" TEXT,
  "body" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SENT',
  "sent_at" TIMESTAMPTZ DEFAULT NOW(),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "actor_id" TEXT,
  "action" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT,
  "metadata_json" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dentist_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "working_hours" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointment_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_inquiries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile; Admins can manage all profiles
DROP POLICY IF EXISTS "Users can view own profile" ON "profiles";
CREATE POLICY "Users can view own profile" ON "profiles"
  FOR SELECT USING (auth.uid() = id);

-- Services: Public can view active services
DROP POLICY IF EXISTS "Public can view active services" ON "services";
CREATE POLICY "Public can view active services" ON "services"
  FOR SELECT USING (is_active = true);

-- Working Hours: Public can view working hours
DROP POLICY IF EXISTS "Public can view working hours" ON "working_hours";
CREATE POLICY "Public can view working hours" ON "working_hours"
  FOR SELECT USING (true);

-- Dentists: Public can view bookable dentists
DROP POLICY IF EXISTS "Public can view bookable dentists" ON "dentist_profiles";
CREATE POLICY "Public can view bookable dentists" ON "dentist_profiles"
  FOR SELECT USING (is_bookable = true);

-- Appointment Requests: Public can insert new requests via booking form
DROP POLICY IF EXISTS "Public can create appointment requests" ON "appointment_requests";
CREATE POLICY "Public can create appointment requests" ON "appointment_requests"
  FOR INSERT WITH CHECK (status = 'PENDING');

-- Clients: Public can insert client during appointment request
DROP POLICY IF EXISTS "Public can create clients" ON "clients";
CREATE POLICY "Public can create clients" ON "clients"
  FOR INSERT WITH CHECK (true);

-- Contact Inquiries: Public can insert contact messages
DROP POLICY IF EXISTS "Public can create contact inquiries" ON "contact_inquiries";
CREATE POLICY "Public can create contact inquiries" ON "contact_inquiries"
  FOR INSERT WITH CHECK (true);

-- Service Role Key bypasses all RLS automatically for secure server-side operations.

-- 10. REALTIME CONFIGURATION
-- Enable replication for appointment_requests table so staff dashboard receives live changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'appointment_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE appointment_requests;
  END IF;
END $$;

-- 11. DEFAULT CLINIC LOCATION & WORKING HOURS SEED
INSERT INTO "clinic_locations" ("id", "name", "address", "phone", "email", "timezone", "is_active")
VALUES (
  'loc-kampala-main',
  'Dr. Dental Crest Dental Surgery',
  'Kampala, Uganda',
  '+256 773 003214',
  'info@crestdentalsurgery.com',
  'Africa/Kampala',
  true
)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "phone" = EXCLUDED."phone",
  "is_active" = true;

-- Seed Monday to Saturday: 08:00 to 20:00, Sunday: 09:00 to 17:00
INSERT INTO "working_hours" ("id", "location_id", "day_of_week", "start_time", "end_time", "is_available", "is_verified")
VALUES
  ('wh-0', 'loc-kampala-main', 0, '09:00', '17:00', true, true), -- Sunday
  ('wh-1', 'loc-kampala-main', 1, '08:00', '20:00', true, true), -- Monday
  ('wh-2', 'loc-kampala-main', 2, '08:00', '20:00', true, true), -- Tuesday
  ('wh-3', 'loc-kampala-main', 3, '08:00', '20:00', true, true), -- Wednesday
  ('wh-4', 'loc-kampala-main', 4, '08:00', '20:00', true, true), -- Thursday
  ('wh-5', 'loc-kampala-main', 5, '08:00', '20:00', true, true), -- Friday (Normal Working Day)
  ('wh-6', 'loc-kampala-main', 6, '08:00', '20:00', true, true)  -- Saturday
ON CONFLICT ("id") DO UPDATE SET
  "start_time" = EXCLUDED."start_time",
  "end_time" = EXCLUDED."end_time",
  "is_available" = EXCLUDED."is_available",
  "is_verified" = EXCLUDED."is_verified",
  "updated_at" = NOW();
