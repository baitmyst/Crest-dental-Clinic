import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

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
    const prismaLogs = await prisma.auditLog.findMany({
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    if (prismaLogs && prismaLogs.length > 0) {
      return prismaLogs.map((l) => ({
        id: l.id,
        createdAt: l.createdAt,
        actor: l.actor
          ? {
              firstName: l.actor.firstName,
              lastName: l.actor.lastName,
              email: l.actor.email,
            }
          : null,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        metadataJson: l.metadataJson,
      }));
    }
  } catch (err) {
    console.warn("Prisma getAuditLogs failed, querying Supabase client:", err);
  }

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
              email: d.actor.email || "",
            }
          : null,
        action: d.action || "SYSTEM_EVENT",
        entityType: d.entity_type || "System",
        entityId: d.entity_id || null,
        metadataJson: d.metadata_json || null,
      }));
    }
  } catch (supaErr) {
    console.warn("Supabase getAuditLogs failed:", supaErr);
  }

  return [];
}

export async function getStaffUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { role: "asc" },
    });
    if (users && users.length > 0) return users;
  } catch (err) {
    console.warn("Prisma getStaffUsers failed, querying Supabase client:", err);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .order("role", { ascending: true });

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
  } catch (supaErr) {
    console.warn("Supabase getStaffUsers failed:", supaErr);
  }

  return [];
}

export async function getDentists() {
  try {
    const dentists = await prisma.dentistProfile.findMany({
      include: {
        user: true,
        services: {
          include: { service: true },
        },
      },
    });
    if (dentists && dentists.length > 0) return dentists;
  } catch (err) {
    console.warn("Prisma getDentists failed, querying Supabase client:", err);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("dentist_profiles")
      .select("*, user:users(*)");

    if (data && !error) {
      return data.map((d: any) => ({
        id: d.id,
        professionalTitle: d.professional_title,
        biography: d.biography,
        specialties: d.specialties,
        isBookable: d.is_bookable,
        qualifications: d.qualifications || null,
        languages: d.languages || null,
        yearsExperience: d.years_experience || null,
        user: d.user
          ? {
              id: d.user.id,
              firstName: d.user.first_name,
              lastName: d.user.last_name,
              email: d.user.email,
              phone: d.user.phone,
            }
          : {
              id: "unknown",
              firstName: "Dr.",
              lastName: "Silver",
              email: "dr.silver@crestdentalsurgery.com",
              phone: "+256 773 003214",
            },
        services: (d.services || []).map((s: any) => ({
          serviceId: s.service_id || s.id,
          service: { name: s.name || s.service?.name || "General Dental Consultation" },
        })),
      }));
    }
  } catch (supaErr) {
    console.warn("Supabase getDentists failed:", supaErr);
  }

  return [];
}

export async function getServices() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
    });
    if (services && services.length > 0) return services;
  } catch (err) {
    console.warn("Prisma getServices failed, querying Supabase client:", err);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .order("name", { ascending: true });

    if (data && !error) {
      return data.map((s: any) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        category: s.category,
        shortDescription: s.short_description,
        fullDescription: s.full_description,
        benefits: s.benefits,
        treatmentProcess: s.treatment_process,
        durationMinutes: s.duration_minutes,
        bufferMinutes: s.buffer_minutes,
        isActive: s.is_active,
        displayOrder: s.display_order,
      }));
    }
  } catch (supaErr) {
    console.warn("Supabase getServices failed:", supaErr);
  }

  return [];
}

export async function getServiceBySlug(slug: string) {
  try {
    const service = await prisma.service.findUnique({ where: { slug } });
    if (service) return service;
  } catch (err) {
    console.warn("Prisma getServiceBySlug failed, querying Supabase client:", err);
  }

  try {
    const { data: s, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (s && !error) {
      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        category: s.category || "General",
        shortDescription: s.short_description || "",
        fullDescription: s.full_description || s.short_description || "",
        benefits: s.benefits || "[]",
        treatmentProcess: s.treatment_process || "[]",
        faqContent: s.faq_content || "[]",
        durationMinutes: s.duration_minutes || 45,
        bufferMinutes: s.buffer_minutes || 15,
        imageUrl: s.image_url || null,
        imageAltText: s.image_alt_text || null,
        isActive: s.is_active ?? true,
        seoTitle: s.seo_title || `${s.name} | Dr. Dental Crest Dental Surgery`,
        seoDescription: s.seo_description || s.short_description || "",
      };
    }
  } catch (supaErr) {
    console.warn("Supabase getServiceBySlug failed:", supaErr);
  }

  return null;
}

export async function getInquiries() {
  try {
    const inquiries = await prisma.contactInquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (inquiries && inquiries.length > 0) return inquiries;
  } catch (err) {
    console.warn("Prisma getInquiries failed, querying Supabase client:", err);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("contact_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      return data.map((i: any) => ({
        id: i.id,
        name: i.name || i.full_name || "Patient",
        fullName: i.full_name || i.name || "Patient",
        phone: i.phone,
        email: i.email,
        subject: i.subject,
        message: i.message,
        status: i.status,
        createdAt: new Date(i.created_at || Date.now()),
      }));
    }
  } catch (supaErr) {
    console.warn("Supabase getInquiries failed:", supaErr);
  }

  return [];
}

export async function getTestimonials() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (testimonials && testimonials.length > 0) return testimonials;
  } catch (err) {
    console.warn("Prisma getTestimonials failed, querying Supabase client:", err);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      return data.map((t: any) => ({
        id: t.id,
        displayName: t.display_name || t.displayName,
        quote: t.quote,
        rating: t.rating,
        consentConfirmed: t.consent_confirmed ?? t.consentConfirmed ?? false,
        isPublished: t.is_published ?? t.isPublished ?? false,
        createdAt: new Date(t.created_at || t.createdAt || Date.now()),
      }));
    }
  } catch (supaErr) {
    console.warn("Supabase getTestimonials failed:", supaErr);
  }

  return [];
}

export async function getFaqs() {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: { displayOrder: "asc" },
    });
    if (faqs && faqs.length > 0) return faqs;
  } catch (err) {
    console.warn("Prisma getFaqs failed, querying Supabase client:", err);
  }

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
  } catch (supaErr) {
    console.warn("Supabase getFaqs failed:", supaErr);
  }

  return [];
}

export async function getBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      include: { category: true, author: true },
      orderBy: { createdAt: "desc" },
    });
    if (posts && posts.length > 0) return posts;
  } catch (err) {
    console.warn("Prisma getBlogPosts failed, querying Supabase client:", err);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      return data.map((b: any) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        content: b.content,
        status: b.status,
        category: { name: "Dental Advice" },
        publishedAt: b.published_at ? new Date(b.published_at) : null,
        createdAt: new Date(b.created_at || Date.now()),
      }));
    }
  } catch (supaErr) {
    console.warn("Supabase getBlogPosts failed:", supaErr);
  }

  return [];
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: { category: true, author: true },
    });
    if (post) return post;
  } catch (err) {
    console.warn("Prisma getBlogPostBySlug failed, querying Supabase client:", err);
  }

  try {
    const { data: b, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (b && !error) {
      return {
        id: b.id,
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        content: b.content,
        status: b.status,
        category: { name: "Dental Health" },
        author: { firstName: "Editorial", lastName: "Team" },
        publishedAt: b.published_at ? new Date(b.published_at) : null,
        createdAt: new Date(b.created_at || Date.now()),
        seoTitle: b.seo_title || b.title,
        seoDescription: b.seo_description || b.excerpt,
      };
    }
  } catch (supaErr) {
    console.warn("Supabase getBlogPostBySlug failed:", supaErr);
  }

  return null;
}

export async function getNotifications() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (notifications && notifications.length > 0) return notifications;
  } catch (err) {
    console.warn("Prisma getNotifications failed, querying Supabase client:", err);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      return data.map((n: any) => ({
        id: n.id,
        recipient: n.recipient,
        channel: n.channel,
        subject: n.subject,
        type: n.type || "APPOINTMENT_REQUEST",
        body: n.body || n.message || "",
        message: n.message || n.body || "",
        status: n.status,
        createdAt: new Date(n.created_at || Date.now()),
      }));
    }
  } catch (supaErr) {
    console.warn("Supabase getNotifications failed:", supaErr);
  }

  return [];
}

export async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });
    if (settings) return settings;
  } catch (err) {
    console.warn("Prisma getSiteSettings failed, querying Supabase client:", err);
  }

  try {
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (data) {
      return {
        id: data.id,
        clinicName: data.clinic_name || "Dr. Dental Crest Dental Surgery",
        primaryColor: data.primary_color || "#181d26",
        secondaryColor: data.secondary_color || "#0a2e0e",
        accentColor: data.accent_color || "#aa2d00",
        contactPhone: data.contact_phone || "+256 773 003214",
        contactEmail: data.contact_email || null,
        whatsappNumber: data.whatsapp_number || null,
        emergencyPhone: data.emergency_phone || "+256 773 003214",
        locationText: data.location_text || "Kampala, Uganda",
        timezone: data.timezone || "Africa/Kampala",
        ratingEnabled: data.rating_enabled || false,
        ratingValue: data.rating_value || 5.0,
        ratingLabel: data.rating_label || "Rated 5.0 by our patients",
      };
    }
  } catch (supaErr) {
    console.warn("Supabase getSiteSettings failed:", supaErr);
  }

  return {
    id: "default",
    clinicName: "Dr. Dental Crest Dental Surgery",
    primaryColor: "#181d26",
    secondaryColor: "#0a2e0e",
    accentColor: "#aa2d00",
    contactPhone: "+256 773 003214",
    contactEmail: null,
    whatsappNumber: null,
    emergencyPhone: "+256 773 003214",
    locationText: "Kampala, Uganda",
    timezone: "Africa/Kampala",
    ratingEnabled: false,
    ratingValue: 5.0,
    ratingLabel: "Rated 5.0 by our patients",
  };
}

export async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        appointments: {
          include: { service: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    if (clients && clients.length > 0) return clients;
  } catch (err) {
    console.warn("Prisma getClients failed, querying Supabase client:", err);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("clients")
      .select("*, appointments:appointment_requests(*, service:services(*))")
      .order("created_at", { ascending: false });

    if (data && !error) {
      return data.map((c: any) => ({
        id: c.id,
        fullName: c.full_name,
        phone: c.phone,
        email: c.email,
        isReturningPatient: c.is_returning_patient || false,
        dateOfBirth: c.date_of_birth || null,
        preferredCommunicationMethod: c.preferred_communication_method || "PHONE",
        createdAt: new Date(c.created_at || Date.now()),
        appointments: (c.appointments || []).map((a: any) => ({
          id: a.id,
          referenceNumber: a.reference_number,
          preferredDate: a.preferred_date,
          preferredTime: a.preferred_time,
          status: a.status,
          service: a.service ? { id: a.service.id, name: a.service.name } : { id: "s", name: "Dental Visit" },
        })),
      }));
    }
  } catch (supaErr) {
    console.warn("Supabase getClients failed:", supaErr);
  }

  return [];
}

export async function getMedia() {
  try {
    const media = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (media && media.length > 0) return media;
  } catch (err) {
    console.warn("Prisma getMedia failed, querying Supabase client:", err);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      return data.map((m: any) => ({
        id: m.id,
        fileName: m.filename || m.file_name || m.fileName || "asset.png",
        filename: m.filename || m.file_name || m.fileName || "asset.png",
        url: m.file_url || m.url || "/placeholder.png",
        fileUrl: m.file_url || m.url || "/placeholder.png",
        altText: m.alt_text || m.title || "Clinic Media",
        mimeType: m.mime_type || "image/png",
        fileSize: m.size_bytes || m.file_size || 0,
        sizeBytes: m.size_bytes || m.file_size || 0,
        title: m.title || "Clinic Media Asset",
        createdAt: new Date(m.created_at || Date.now()),
      }));
    }
  } catch (supaErr) {
    console.warn("Supabase getMedia failed:", supaErr);
  }

  return [];
}

export async function getAppointments(whereClause?: any) {
  try {
    const appointments = await prisma.appointmentRequest.findMany({
      where: whereClause,
      include: {
        client: true,
        service: true,
        assignedDentist: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    if (appointments && appointments.length > 0) return appointments;
  } catch (err) {
    console.warn("Prisma getAppointments failed, querying Supabase client:", err);
  }

  try {
    let query = supabaseAdmin
      .from("appointment_requests")
      .select("*, client:clients(*), service:services(*), assignedDentist:dentist_profiles(*, user:users(*))")
      .order("created_at", { ascending: false });

    if (whereClause?.status) {
      query = query.eq("status", whereClause.status);
    }
    if (whereClause?.assignedDentistId) {
      query = query.eq("assigned_dentist_id", whereClause.assignedDentistId);
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
        createdAt: new Date(a.created_at || Date.now()).toISOString(),
        client: a.client
          ? {
              id: a.client.id,
              fullName: a.client.full_name,
              phone: a.client.phone,
              email: a.client.email,
            }
          : { id: "unknown", fullName: "Walk-in Patient", phone: "+256 773 003214", email: "" },
        service: a.service
          ? { id: a.service.id, name: a.service.name }
          : { id: "general", name: "General Dental Consultation" },
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
  } catch (supaErr) {
    console.warn("Supabase getAppointments failed:", supaErr);
  }

  return [];
}
