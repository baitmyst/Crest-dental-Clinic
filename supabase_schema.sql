-- ==============================================================================
-- DR. DENTAL CREST DENTAL SURGERY - SUPABASE PRODUCTION DATABASE SCHEMA & SEED
-- Clinic Location: Kampala, Uganda | Phone: +256 773 003214
-- ==============================================================================

-- 1. DROP EXISTING TABLES (IF RESETTING)
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "media_assets" CASCADE;
DROP TABLE IF EXISTS "blog_posts" CASCADE;
DROP TABLE IF EXISTS "blog_categories" CASCADE;
DROP TABLE IF EXISTS "faqs" CASCADE;
DROP TABLE IF EXISTS "testimonials" CASCADE;
DROP TABLE IF EXISTS "contact_inquiries" CASCADE;
DROP TABLE IF EXISTS "appointment_requests" CASCADE;
DROP TABLE IF EXISTS "time_off" CASCADE;
DROP TABLE IF EXISTS "blocked_slots" CASCADE;
DROP TABLE IF EXISTS "working_hours" CASCADE;
DROP TABLE IF EXISTS "clinic_locations" CASCADE;
DROP TABLE IF EXISTS "dentist_services" CASCADE;
DROP TABLE IF EXISTS "services" CASCADE;
DROP TABLE IF EXISTS "dentist_profiles" CASCADE;
DROP TABLE IF EXISTS "clients" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "site_settings" CASCADE;

-- 2. CREATE CORE TABLES

-- Site Settings
CREATE TABLE "site_settings" (
  "id" TEXT PRIMARY KEY DEFAULT 'default',
  "clinic_name" TEXT NOT NULL DEFAULT 'Dr. Dental Crest Dental Surgery',
  "logo_url" TEXT,
  "favicon_url" TEXT,
  "primary_color" TEXT NOT NULL DEFAULT '#181d26',
  "secondary_color" TEXT NOT NULL DEFAULT '#0a2e0e',
  "accent_color" TEXT NOT NULL DEFAULT '#aa2d00',
  "contact_email" TEXT,
  "contact_phone" TEXT NOT NULL DEFAULT '+256 773 003214',
  "whatsapp_number" TEXT,
  "is_whatsapp_verified" BOOLEAN NOT NULL DEFAULT false,
  "emergency_phone" TEXT DEFAULT '+256 773 003214',
  "location_text" TEXT NOT NULL DEFAULT 'Kampala, Uganda',
  "timezone" TEXT NOT NULL DEFAULT 'Africa/Kampala',
  "default_seo_title" TEXT NOT NULL DEFAULT 'Dr. Dental Crest Dental Surgery | Trusted Dental Care in Kampala',
  "default_seo_description" TEXT NOT NULL DEFAULT 'Dr. Dental Crest Dental Surgery provides professional general, cosmetic, restorative, orthodontic, and family dental care in Kampala. Request an appointment today.',
  "social_links" TEXT,
  "booking_settings" TEXT,
  "notification_settings" TEXT,
  "rating_enabled" BOOLEAN NOT NULL DEFAULT false,
  "rating_value" DOUBLE PRECISION DEFAULT 5.0,
  "rating_label" TEXT DEFAULT 'Rated 5.0 by our patients',
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users (Staff Only - Admin, Receptionist, Dentist)
CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "phone" TEXT,
  "password_hash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'RECEPTIONIST',
  "image_url" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "email_verified_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clients (No account creation or passwords)
CREATE TABLE "clients" (
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

-- Dentist Profiles
CREATE TABLE "dentist_profiles" (
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

-- Services (Strictly ZERO public price fields)
CREATE TABLE "services" (
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

-- Dentist Services Junction
CREATE TABLE "dentist_services" (
  "dentist_id" TEXT NOT NULL REFERENCES "dentist_profiles"("id") ON DELETE CASCADE,
  "service_id" TEXT NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
  PRIMARY KEY ("dentist_id", "service_id")
);

-- Clinic Locations
CREATE TABLE "clinic_locations" (
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

-- Working Hours
CREATE TABLE "working_hours" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "dentist_id" TEXT REFERENCES "dentist_profiles"("id") ON DELETE CASCADE,
  "location_id" TEXT NOT NULL REFERENCES "clinic_locations"("id") ON DELETE CASCADE,
  "day_of_week" INT NOT NULL,
  "start_time" TEXT NOT NULL,
  "end_time" TEXT NOT NULL,
  "is_available" BOOLEAN NOT NULL DEFAULT true,
  "is_verified" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blocked Slots
CREATE TABLE "blocked_slots" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "dentist_id" TEXT REFERENCES "dentist_profiles"("id") ON DELETE CASCADE,
  "location_id" TEXT NOT NULL REFERENCES "clinic_locations"("id") ON DELETE CASCADE,
  "start_at" TIMESTAMPTZ NOT NULL,
  "end_at" TIMESTAMPTZ NOT NULL,
  "reason" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Time Off
CREATE TABLE "time_off" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "dentist_id" TEXT NOT NULL REFERENCES "dentist_profiles"("id") ON DELETE CASCADE,
  "location_id" TEXT NOT NULL REFERENCES "clinic_locations"("id") ON DELETE CASCADE,
  "start_at" TIMESTAMPTZ NOT NULL,
  "end_at" TIMESTAMPTZ NOT NULL,
  "reason" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Appointment Requests (Guest Booking Flow)
CREATE TABLE "appointment_requests" (
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
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "source" TEXT NOT NULL DEFAULT 'WEBSITE',
  "client_message" TEXT,
  "internal_note" TEXT,
  "cancellation_reason" TEXT,
  "cancellation_token" TEXT UNIQUE,
  "cancellation_token_expires_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contact Inquiries
CREATE TABLE "contact_inquiries" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "assigned_to_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "internal_note" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Testimonials
CREATE TABLE "testimonials" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "display_name" TEXT NOT NULL,
  "quote" TEXT NOT NULL,
  "rating" INT DEFAULT 5,
  "image_url" TEXT,
  "consent_confirmed" BOOLEAN NOT NULL DEFAULT false,
  "is_published" BOOLEAN NOT NULL DEFAULT false,
  "display_order" INT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FAQs
CREATE TABLE "faqs" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'General',
  "is_published" BOOLEAN NOT NULL DEFAULT true,
  "display_order" INT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog Categories
CREATE TABLE "blog_categories" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL
);

-- Blog Posts
CREATE TABLE "blog_posts" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "excerpt" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "featured_image_url" TEXT,
  "featured_image_alt_text" TEXT,
  "author_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "category_id" TEXT REFERENCES "blog_categories"("id") ON DELETE SET NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "published_at" TIMESTAMPTZ,
  "seo_title" TEXT,
  "seo_description" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Media Assets
CREATE TABLE "media_assets" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "file_name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "alt_text" TEXT NOT NULL,
  "title" TEXT,
  "mime_type" TEXT NOT NULL,
  "file_size" INT NOT NULL,
  "uploaded_by_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE "notifications" (
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

-- Audit Logs
CREATE TABLE "audit_logs" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "actor_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "action" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT,
  "metadata_json" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY & DEFINE POLICIES
ALTER TABLE "site_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dentist_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "working_hours" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "faqs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "testimonials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blog_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blog_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointment_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_inquiries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- Public read policies for published content
CREATE POLICY "Public can view site settings" ON "site_settings" FOR SELECT USING (true);
CREATE POLICY "Public can view active services" ON "services" FOR SELECT USING ("is_active" = true);
CREATE POLICY "Public can view bookable dentists" ON "dentist_profiles" FOR SELECT USING ("is_bookable" = true);
CREATE POLICY "Public can view working hours" ON "working_hours" FOR SELECT USING (true);
CREATE POLICY "Public can view published faqs" ON "faqs" FOR SELECT USING ("is_published" = true);
CREATE POLICY "Public can view published testimonials" ON "testimonials" FOR SELECT USING ("is_published" = true);
CREATE POLICY "Public can view published blog posts" ON "blog_posts" FOR SELECT USING ("status" = 'PUBLISHED');
CREATE POLICY "Public can view blog categories" ON "blog_categories" FOR SELECT USING (true);

-- Public insert policies for booking and contact forms
CREATE POLICY "Public can create clients" ON "clients" FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create appointment requests" ON "appointment_requests" FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create contact inquiries" ON "contact_inquiries" FOR INSERT WITH CHECK (true);

-- Service Role (backend API) bypasses all RLS automatically.

-- 4. INSERT INITIAL PRODUCTION SEED DATA

-- Site Settings
INSERT INTO "site_settings" ("id", "clinic_name", "primary_color", "secondary_color", "accent_color", "contact_phone", "emergency_phone", "location_text", "timezone", "default_seo_title", "default_seo_description", "rating_enabled", "rating_value", "rating_label", "booking_settings", "notification_settings", "social_links")
VALUES (
  'default',
  'Dr. Dental Crest Dental Surgery',
  '#181d26',
  '#0a2e0e',
  '#aa2d00',
  '+256 773 003214',
  '+256 773 003214',
  'Kampala, Uganda',
  'Africa/Kampala',
  'Dr. Dental Crest Dental Surgery | Trusted Dental Care in Kampala',
  'Dr. Dental Crest Dental Surgery provides professional general, cosmetic, restorative, orthodontic, and family dental care in Kampala. Request an appointment today.',
  false,
  5.0,
  'Rated 5.0 by our patients',
  '{"manualConfirmation":true,"bufferMinutes":15,"leadTimeHours":2,"maxAdvanceDays":60}',
  '{"emailEnabled":true,"smsEnabled":false,"whatsappEnabled":false}',
  '{}'
);

-- Clinic Location
INSERT INTO "clinic_locations" ("id", "name", "address", "directions_note", "phone", "timezone", "is_public_address_verified", "is_active")
VALUES (
  'loc-kampala-main',
  'Dr. Dental Crest Dental Surgery',
  NULL,
  'Visit our Kampala clinic. Please call us for directions.',
  '+256 773 003214',
  'Africa/Kampala',
  false,
  true
);

-- Operating Hours (with Friday locked as draft / unverified)
INSERT INTO "working_hours" ("id", "location_id", "day_of_week", "start_time", "end_time", "is_available", "is_verified") VALUES
('wh-1', 'loc-kampala-main', 1, '08:00', '20:00', true, true),
('wh-2', 'loc-kampala-main', 2, '08:00', '20:00', true, true),
('wh-3', 'loc-kampala-main', 3, '08:00', '20:00', true, true),
('wh-4', 'loc-kampala-main', 4, '08:00', '20:00', true, true),
('wh-5', 'loc-kampala-main', 5, '08:00', '08:30', false, false), -- Friday requires admin confirmation
('wh-6', 'loc-kampala-main', 6, '08:00', '20:00', true, true),
('wh-0', 'loc-kampala-main', 0, '09:00', '17:00', true, true);

-- Staff Users (bcrypt password hashes)
-- Admin: AdminPass2026!
-- Receptionist: ReceptPass2026!
-- Dr. Silver: SilverDentist2026!
INSERT INTO "users" ("id", "first_name", "last_name", "email", "phone", "password_hash", "role", "is_active", "email_verified_at") VALUES
('user-admin-01', 'Clinic', 'Administrator', 'admin@crestdentalsurgery.com', '+256 773 003214', '$2a$10$f3F8gC.q/Jp1Q4yE769D7O7z5UqHlA98yVfNn9L8yWvO0Y.K.72uO', 'ADMIN', true, NOW()),
('user-recept-01', 'Front', 'Desk', 'receptionist@crestdentalsurgery.com', '+256 773 003214', '$2a$10$F3e8p5m9K2gH4w1L8yJ9rOhzN2Q.E64s.Z7p1Q0Y.K.72uOBc91la', 'RECEPTIONIST', true, NOW()),
('user-silver-01', 'Dr.', 'Silver', 'dr.silver@crestdentalsurgery.com', '+256 773 003214', '$2a$10$oYh8q9J4K2gH4w1L8yJ9rOhzN2Q.E64s.Z7p1Q0Y.K.72uOBc91la', 'DENTIST', true, NOW());

-- Dr. Silver Profile
INSERT INTO "dentist_profiles" ("id", "user_id", "professional_title", "specialties", "qualifications", "biography", "languages", "years_experience", "display_order", "is_bookable")
VALUES (
  'profile-silver-01',
  'user-silver-01',
  'Lead Dental Surgeon',
  'General Dentistry, Cosmetic Care, Orthodontics, Implants, Children''s Dentistry',
  NULL,
  'Dr. Silver leads the dental care team at Dr. Dental Crest Dental Surgery in Kampala, committed to attentive, individualized oral health and smile care for patients of all ages.',
  NULL,
  NULL,
  1,
  true
);

-- Core Dental Services (Zero price fields)
INSERT INTO "services" ("id", "name", "slug", "category", "short_description", "full_description", "benefits", "treatment_process", "faq_content", "duration_minutes", "buffer_minutes", "seo_title", "seo_description", "is_active") VALUES
(
  'srv-general',
  'General Dentistry & Check-Ups',
  'general-dentistry-checkups',
  'General',
  'Routine dental evaluations, gentle cleanings, cavity prevention, and comprehensive oral health maintenance for long-term dental wellness.',
  'Our general dentistry consultations provide meticulous assessments of teeth, gums, and soft tissues. We focus on proactive oral health, early detection, and gentle care tailored to every patient''s comfort in Kampala.',
  '["Comprehensive oral health and gum tissue assessment","Gentle, thorough dental cleaning and plaque removal","Early detection of tooth decay and dental concerns","Personalized daily home-care guidance"]',
  '[{"step":"Initial Consultation","desc":"Discussion of oral health history and any discomfort or goals."},{"step":"Clinical Examination","desc":"Detailed evaluation of teeth, gums, and oral structures."},{"step":"Hygiene & Care","desc":"Professional cleaning and preventive maintenance recommendations."},{"step":"Ongoing Care Plan","desc":"Guidance on recall frequency and tailored home hygiene tips."}]',
  '[{"q":"How often should I schedule a check-up?","a":"Most adults and children benefit from a routine assessment every six months."},{"q":"Is the routine evaluation painful?","a":"Our clinic prioritizes gentle, patient-centered techniques to ensure comfort."}]',
  45,
  15,
  'General Dentistry & Dental Check-Ups in Kampala | Dr. Dental Crest',
  'Professional dental check-ups, cleanings, and preventative oral health care at Dr. Dental Crest Dental Surgery in Kampala. Request an appointment.',
  true
),
(
  'srv-cosmetic',
  'Cosmetic Dentistry & Veneers',
  'cosmetic-dentistry-veneers',
  'Cosmetic',
  'Custom smile enhancements, aesthetic veneer consultations, tooth contouring, and subtle refinements tailored to your natural features.',
  'Cosmetic dentistry at Dr. Dental Crest focuses on creating harmonious, confident smiles. Whether you are interested in veneers or aesthetic adjustments, Dr. Silver assesses your smile aesthetics with care and precision.',
  '["Tailored smile assessments aligned with your facial aesthetics","Modern veneer consultations for chip, gap, or shade refinement","Conservative approaches that preserve natural tooth structure","Natural-looking results designed for lasting confidence"]',
  '[{"step":"Aesthetic Evaluation","desc":"Detailed discussion of your smile goals and facial symmetry."},{"step":"Treatment Planning","desc":"Customized aesthetic mapping and shade selection."},{"step":"Preparation & Fitting","desc":"Careful preparation and bespoke placement of cosmetic restorations."},{"step":"Final Review","desc":"Assessment of bite, comfort, and natural aesthetic finish."}]',
  '[{"q":"What are dental veneers?","a":"Veneers are thin, custom-crafted shells designed to cover the front surface of teeth to improve appearance."},{"q":"How do I know if cosmetic care is right for me?","a":"A personalized consultation helps evaluate your dental health and aesthetic objectives."}]',
  60,
  15,
  'Cosmetic Dentistry & Veneers in Kampala | Dr. Dental Crest',
  'Aesthetic dental care and veneer consultations in Kampala. Enhance your smile with personalized treatments at Dr. Dental Crest Dental Surgery.',
  true
),
(
  'srv-implants',
  'Dental Implants & Prosthetics',
  'dental-implants-prosthetics',
  'Restorative',
  'Consultations and planning for tooth replacement solutions, crown restorations, bridges, and durable prosthetics.',
  'Restore function, chewing comfort, and smile completeness with restorative dental solutions. Our team evaluates your bone support, gum health, and bite to formulate an individualized restorative plan.',
  '["Comprehensive replacement planning for single or multiple missing teeth","Restoration of natural chewing function and speech clarity","Preservation of surrounding facial and jaw structure","Durable, custom-crafted prosthetic solutions"]',
  '[{"step":"Clinical & Bone Assessment","desc":"Detailed assessment of oral anatomy and bone readiness."},{"step":"Restorative Roadmap","desc":"Formulation of an individualized prosthetic and surgical sequence."},{"step":"Precision Placement","desc":"Meticulous restorative placement and integration phase."},{"step":"Long-term Maintenance","desc":"Scheduled reviews to ensure stability and prosthetic longevity."}]',
  '[{"q":"Who is a candidate for dental implants?","a":"Adults with healthy gums and adequate jawbone support are typically suitable candidates."},{"q":"How long do restorative prosthetics last?","a":"With diligent oral hygiene and regular check-ups, prosthetics offer long-term durability."}]',
  60,
  15,
  'Dental Implants & Prosthetics in Kampala | Dr. Dental Crest',
  'Consultations for missing tooth replacement, crowns, bridges, and dental implants at Dr. Dental Crest Dental Surgery in Kampala.',
  true
),
(
  'srv-pediatric',
  'Children’s Dentistry',
  'childrens-dentistry',
  'Pediatric',
  'Gentle, compassionate pediatric dental visits that foster positive oral hygiene habits and lifelong healthy smiles.',
  'We provide a calm, reassuring clinic atmosphere for infants, children, and teenagers. Our focus is on making dental visits enjoyable while monitoring dental development, preventing cavities, and educating young patients.',
  '["Warm, patient-first approach designed to minimize young patient anxiety","Early cavity prevention, fissure sealants, and fluoride guidance","Monitoring of dental eruption, bite development, and spacing","Empowering parents and children with fun, effective brushing habits"]',
  '[{"step":"Friendly Welcome","desc":"Helping your child feel comfortable and safe in the dental chair."},{"step":"Gentle Examination","desc":"Careful check of developing teeth, gums, and oral milestones."},{"step":"Preventive Care","desc":"Gentle cleaning and protective recommendations where appropriate."},{"step":"Parent Coaching","desc":"Supportive advice on diet, snacking habits, and home hygiene routines."}]',
  '[{"q":"At what age should a child first visit the dentist?","a":"We recommend scheduling a first dental visit by their first birthday or when their first tooth appears."},{"q":"How can I prepare my child for their visit?","a":"Keep explanations simple, positive, and reassuring without using fear-inducing words."}]',
  30,
  15,
  'Children''s Dentistry in Kampala | Gentle Pediatric Dental Care',
  'Compassionate, gentle dental care for children and teens in Kampala. Friendly visits and preventive check-ups at Dr. Dental Crest Dental Surgery.',
  true
),
(
  'srv-ortho',
  'Orthodontics',
  'orthodontics',
  'Orthodontics',
  'Assessments for teeth alignment, bite correction, spacing issues, and guidance toward balanced dental harmony.',
  'Orthodontic evaluations assess dental crowding, gaps, overbites, and alignment concerns. Dr. Silver provides consultations to outline appropriate alignment paths for both adolescents and adults.',
  '["Detailed alignment and bite relationship analysis","Improvement in chewing efficiency and speech balance","Easier plaque removal and reduced wear on misaligned teeth","Enhancement of smile symmetry and facial balance"]',
  '[{"step":"Orthodontic Assessment","desc":"Evaluation of dental arches, tooth alignment, and bite harmony."},{"step":"Diagnostic Analysis","desc":"Detailed review of facial profile and tooth positions."},{"step":"Options Consultation","desc":"Discussion of suitable alignment solutions and estimated timelines."},{"step":"Progressive Alignment","desc":"Periodic adjustment visits and attentive progress tracking."}]',
  '[{"q":"Can adults receive orthodontic consultations?","a":"Yes, orthodontic assessments are suitable for patients of any age with healthy gums and bone support."},{"q":"How long does orthodontic alignment usually take?","a":"Duration varies significantly depending on individual alignment complexity."}]',
  45,
  15,
  'Orthodontic Consultations in Kampala | Dr. Dental Crest Dental Surgery',
  'Teeth alignment assessments and orthodontic consultations in Kampala. Discover options for your smile with Dr. Silver.',
  true
);

-- Link Dr. Silver to services
INSERT INTO "dentist_services" ("dentist_id", "service_id") VALUES
('profile-silver-01', 'srv-general'),
('profile-silver-01', 'srv-cosmetic'),
('profile-silver-01', 'srv-implants'),
('profile-silver-01', 'srv-pediatric'),
('profile-silver-01', 'srv-ortho');

-- FAQs
INSERT INTO "faqs" ("id", "category", "question", "answer", "display_order", "is_published") VALUES
('faq-1', 'Appointments', 'How do I request an appointment?', 'You can submit an appointment request through our website or call the clinic. Our team will contact you to confirm an available time.', 1, true),
('faq-2', 'Appointments', 'Do I need an account to request an appointment?', 'No. You can request an appointment as a guest without creating an account.', 2, true),
('faq-3', 'Appointments', 'Will my appointment be confirmed immediately?', 'Appointment requests are reviewed by our clinic team. We will contact you to confirm your appointment time.', 3, true),
('faq-4', 'Services', 'Can children receive dental care at the clinic?', 'Yes. Select Children’s Dentistry when submitting your request and provide the relevant details.', 4, true),
('faq-5', 'Clinic Visit', 'What should I bring to my dental appointment?', 'Our team will let you know if any documents are required when confirming your appointment. Please contact the clinic if you have questions before your visit.', 5, true),
('faq-6', 'Contact', 'How can I contact the clinic?', 'You can call Dr. Dental Crest Dental Surgery at +256 773 003214 or use the contact and appointment-request forms on this website.', 6, true);

-- Blog Categories
INSERT INTO "blog_categories" ("id", "name", "slug") VALUES
('cat-oral-health', 'Oral Health Advice', 'oral-health-advice'),
('cat-pediatric', 'Family Dentistry', 'family-dentistry'),
('cat-ortho', 'Orthodontics & Smiles', 'orthodontics-smiles');

-- Initial Appointment Requests (For staff admin demo)
INSERT INTO "clients" ("id", "full_name", "phone", "email", "is_returning_patient", "preferred_communication_method") VALUES
('client-grace-01', 'Grace Nabakooza', '+256 701 234567', 'grace.nabakooza@example.com', false, 'phone'),
('client-david-02', 'David Mukasa', '+256 782 987654', 'david.mukasa@example.com', true, 'phone');

INSERT INTO "appointment_requests" ("id", "reference_number", "client_id", "service_id", "preferred_dentist_id", "assigned_dentist_id", "location_id", "preferred_date", "preferred_time", "status", "source", "client_message", "internal_note") VALUES
('apt-01', 'DDC-2026-000001', 'client-grace-01', 'srv-general', 'profile-silver-01', 'profile-silver-01', 'loc-kampala-main', '2026-09-22', '10:00', 'PENDING', 'WEBSITE', 'Requesting a routine dental check-up and cleaning in the morning.', 'Guest request received via website. Ready for receptionist phone call to confirm.'),
('apt-02', 'DDC-2026-000002', 'client-david-02', 'srv-cosmetic', 'profile-silver-01', 'profile-silver-01', 'loc-kampala-main', '2026-09-23', '14:00', 'CONFIRMED', 'PHONE', 'Consultation regarding veneer options.', 'Confirmed via phone call with patient.');

INSERT INTO "contact_inquiries" ("id", "name", "email", "phone", "subject", "message", "status") VALUES
('inq-01', 'Arthur Kato', 'arthur.kato@example.com', '+256 752 112233', 'Directions to clinic in Kampala', 'Hello, could you provide directions from Kololo to your clinic? Thank you.', 'OPEN');
