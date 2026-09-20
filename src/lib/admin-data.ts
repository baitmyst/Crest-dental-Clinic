import { supabaseAdmin } from "@/services/supabase";

export interface SafeAuditLog {
  id: string;
  createdAt: Date;
  actor: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadataJson?: string | null;
}

export async function getAuditLogs(): Promise<SafeAuditLog[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("audit_logs")
      .select("*, actor:users(*)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data && !error) {
      return data.map((d: any) => ({
        id: d.id,
        createdAt: new Date(d.created_at || Date.now()),
        actor: d.actor
          ? {
              firstName: d.actor.first_name || "Clinic",
              lastName: d.actor.last_name || "Staff",
              email: d.actor.email || "staff@crestdentalsurgery.com",
            }
          : null,
        action: d.action,
        entityType: d.entity_type,
        entityId: d.entity_id,
        metadataJson: d.metadata_json,
      }));
    }
  } catch (err) {
    console.error("Supabase getAuditLogs error:", err);
  }
  return [];
}

export async function getStaffUsers() {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, first_name, last_name, email, phone, role, is_active, created_at")
      .order("created_at", { ascending: true });

    if (data && !error) {
      return data.map((u: any) => ({
        id: u.id,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        isActive: u.is_active,
        createdAt: new Date(u.created_at || Date.now()),
      }));
    }
  } catch (err) {
    console.error("Supabase getStaffUsers error:", err);
  }
  return [];
}

export async function getDentists() {
  try {
    const { data, error } = await supabaseAdmin
      .from("dentist_profiles")
      .select("*, user:users(*)")
      .order("display_order", { ascending: true });

    if (data && !error) {
      return data.map((d: any) => ({
        id: d.id,
        userId: d.user_id,
        professionalTitle: d.professional_title,
        specialties: d.specialties,
        biography: d.biography,
        displayOrder: d.display_order,
        isBookable: d.is_bookable,
        qualifications: d.qualifications || null,
        yearsExperience: d.years_experience || null,
        services: [],
        user: d.user
          ? {
              id: d.user.id,
              firstName: d.user.first_name,
              lastName: d.user.last_name,
              email: d.user.email,
              phone: d.user.phone,
              imageUrl: d.user.image_url,
            }
          : { id: "u-silver", firstName: "Dr.", lastName: "Silver", email: "dr.silver@crestdentalsurgery.com" },
      }));
    }
  } catch (err) {
    console.error("Supabase getDentists error:", err);
  }
  return [];
}

export async function getServices() {
  try {
    const { data, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .order("created_at", { ascending: true });

    if (data && !error) {
      return data.map((s: any) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        category: s.category,
        shortDescription: s.short_description,
        fullDescription: s.full_description,
        durationMinutes: s.duration_minutes,
        bufferMinutes: s.buffer_minutes,
        isActive: s.is_active,
        benefits: typeof s.benefits === "string" ? s.benefits : JSON.stringify(s.benefits || []),
        treatmentProcess: typeof s.treatment_process === "string" ? s.treatment_process : JSON.stringify(s.treatment_process || []),
        faqContent: typeof s.faq_content === "string" ? s.faq_content : JSON.stringify(s.faq_content || []),
      }));
    }
  } catch (err) {
    console.error("Supabase getServices error:", err);
  }
  return [];
}

export async function getServiceBySlug(slug: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (data && !error) {
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        category: data.category,
        shortDescription: data.short_description,
        fullDescription: data.full_description,
        durationMinutes: data.duration_minutes,
        bufferMinutes: data.buffer_minutes,
        isActive: data.is_active,
        benefits: typeof data.benefits === "string" ? data.benefits : JSON.stringify(data.benefits || []),
        treatmentProcess: typeof data.treatment_process === "string" ? data.treatment_process : JSON.stringify(data.treatment_process || []),
        faqContent: typeof data.faq_content === "string" ? data.faq_content : JSON.stringify(data.faq_content || []),
        seoTitle: data.seo_title,
        seoDescription: data.seo_description,
      };
    }
  } catch (err) {
    console.error("Supabase getServiceBySlug error:", err);
  }
  return null;
}

export async function getInquiries() {
  try {
    const { data, error } = await supabaseAdmin
      .from("contact_inquiries")
      .select("*, assignedTo:users(*)")
      .order("created_at", { ascending: false });

    if (data && !error) {
      return data.map((i: any) => ({
        id: i.id,
        name: i.name,
        email: i.email,
        phone: i.phone,
        subject: i.subject,
        message: i.message,
        status: i.status,
        internalNote: i.internal_note,
        createdAt: new Date(i.created_at || Date.now()),
      }));
    }
  } catch (err) {
    console.error("Supabase getInquiries error:", err);
  }
  return [];
}

export async function getTestimonials() {
  try {
    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .select("*")
      .order("display_order", { ascending: true });

    if (data && !error) {
      return data.map((t: any) => ({
        id: t.id,
        displayName: t.display_name,
        quote: t.quote,
        rating: t.rating || 5,
        isPublished: t.is_published,
        consentConfirmed: t.consent_confirmed ?? false,
        createdAt: new Date(t.created_at || Date.now()),
      }));
    }
  } catch (err) {
    console.error("Supabase getTestimonials error:", err);
  }
  return [];
}

export async function getFaqs() {
  try {
    const { data, error } = await supabaseAdmin
      .from("faqs")
      .select("*")
      .order("display_order", { ascending: true });

    if (data && !error) {
      return data.map((f: any) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category,
        isPublished: f.is_published,
        displayOrder: f.display_order,
      }));
    }
  } catch (err) {
    console.error("Supabase getFaqs error:", err);
  }
  return [];
}

export async function getNotifications() {
  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*, client:clients(*)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data && !error) {
      return data.map((n: any) => ({
        id: n.id,
        recipient: n.recipient,
        channel: n.channel,
        type: n.type,
        subject: n.subject,
        body: n.body,
        status: n.status,
        sentAt: n.sent_at ? new Date(n.sent_at) : null,
        createdAt: new Date(n.created_at || Date.now()),
      }));
    }
  } catch (err) {
    console.error("Supabase getNotifications error:", err);
  }
  return [];
}

export async function getSiteSettings() {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .maybeSingle();

    if (data && !error) {
      return {
        id: data.id,
        clinicName: data.clinic_name,
        contactPhone: data.contact_phone,
        emergencyPhone: data.emergency_phone,
        locationText: data.location_text,
        timezone: data.timezone,
        defaultSeoTitle: data.default_seo_title,
        defaultSeoDescription: data.default_seo_description,
        ratingEnabled: data.rating_enabled,
        ratingValue: data.rating_value,
        ratingLabel: data.rating_label,
      };
    }
  } catch (err) {
    console.error("Supabase getSiteSettings error:", err);
  }
  return {
    id: "default",
    clinicName: "Dr. Dental Crest Dental Surgery",
    contactPhone: "+256 773 003214",
    emergencyPhone: "+256 773 003214",
    locationText: "Kampala, Uganda",
    timezone: "Africa/Kampala",
    defaultSeoTitle: "Dr. Dental Crest Dental Surgery | Trusted Dental Care in Kampala",
    defaultSeoDescription: "Professional dental care in Kampala, Uganda.",
    ratingEnabled: false,
    ratingValue: 5.0,
    ratingLabel: "Rated 5.0 by our patients",
  };
}

export async function getClients() {
  try {
    const { data, error } = await supabaseAdmin
      .from("clients")
      .select("*, appointments:appointment_requests(id, reference_number, preferred_date, preferred_time, status, service:services(name))")
      .order("created_at", { ascending: false });

    if (data && !error) {
      return data.map((c: any) => ({
        id: c.id,
        fullName: c.full_name,
        phone: c.phone,
        email: c.email,
        dateOfBirth: c.date_of_birth,
        isReturningPatient: c.is_returning_patient,
        preferredCommunicationMethod: c.preferred_communication_method,
        createdAt: new Date(c.created_at || Date.now()),
        appointments: (c.appointments || []).map((a: any) => ({
          id: a.id,
          referenceNumber: a.reference_number,
          preferredDate: a.preferred_date,
          preferredTime: a.preferred_time,
          status: a.status,
          service: a.service ? { name: a.service.name } : { name: "Dental Care" },
        })),
        appointmentRequests: (c.appointments || []).map((a: any) => ({
          id: a.id,
          referenceNumber: a.reference_number,
          preferredDate: a.preferred_date,
          preferredTime: a.preferred_time,
          status: a.status,
          service: a.service ? { name: a.service.name } : { name: "Dental Care" },
        })),
      }));
    }
  } catch (err) {
    console.error("Supabase getClients error:", err);
  }
  return [];
}

export async function getMedia() {
  try {
    const { data, error } = await supabaseAdmin
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      return data.map((m: any) => ({
        id: m.id,
        fileName: m.file_name,
        url: m.url,
        altText: m.alt_text,
        title: m.title,
        mimeType: m.mime_type,
        fileSize: m.file_size,
        createdAt: new Date(m.created_at || Date.now()),
      }));
    }
  } catch (err) {
    console.error("Supabase getMedia error:", err);
  }
  return [];
}

export async function getAppointments(whereClause?: any) {
  try {
    let query = supabaseAdmin
      .from("appointment_requests")
      .select(`
        *,
        client:clients(*),
        service:services(*),
        assignedDentist:dentist_profiles!appointment_requests_assigned_dentist_id_fkey(*, user:users(*))
      `)
      .order("created_at", { ascending: false });

    if (whereClause?.status) {
      query = query.eq("status", whereClause.status);
    }
    if (whereClause?.assignedDentistId) {
      query = query.eq("assigned_dentist_id", whereClause.assignedDentistId);
    }
    if (whereClause?.preferredDate) {
      query = query.eq("preferred_date", whereClause.preferredDate);
    }

    const { data, error } = await query;

    if (data && !error) {
      return data.map((a: any) => ({
        id: a.id,
        referenceNumber: a.reference_number,
        preferredDate: a.preferred_date,
        preferredTime: a.preferred_time,
        status: a.status,
        source: a.source,
        clientMessage: a.client_message,
        internalNote: a.internal_note,
        createdAt: new Date(a.created_at || Date.now()),
        client: a.client
          ? {
              id: a.client.id,
              fullName: a.client.full_name,
              phone: a.client.phone,
              email: a.client.email,
            }
          : { id: "unknown", fullName: "Guest Patient", phone: "", email: "" },
        service: a.service
          ? {
              id: a.service.id,
              name: a.service.name,
            }
          : { id: "srv-default", name: "Dental Consultation" },
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
  } catch (err) {
    console.error("Supabase getAppointments error:", err);
  }
  return [];
}
