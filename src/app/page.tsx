import Link from "next/link";
import Image from "next/image";
import FaqAccordion from "@/components/ui/FaqAccordion";
import {
  Calendar,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  HelpCircle,
  MapPin,
  Smile,
  HeartHandshake,
  Stethoscope,
} from "lucide-react";
import {
  CLINIC_NAME,
  CLINIC_CITY,
  CLINIC_PHONE,
  CLINIC_PHONE_DIGITS,
  LEAD_SPECIALIST,
  PRIMARY_CTA,
  SECONDARY_CTA,
  SAFE_DIRECTIONS_NOTICE,
  PRIMARY_SERVICES,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  // Fetch site settings and FAQs
  let settings = null;
  let faqs: Array<{ id: string; question: string; answer: string }> = [];

  try {
    settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    faqs = await prisma.faq.findMany({
      where: { isPublished: true },
      take: 6,
      orderBy: { displayOrder: "asc" },
    });
  } catch {
    // Fallback if db is being migrated
  }

  const isRatingEnabled = settings?.ratingEnabled ?? false;
  const ratingLabel = settings?.ratingLabel ?? "Rated 5.0 by our patients";

  return (
    <div className="bg-white">
      {/* 1. HERO SECTION */}
      <section className="section-rhythm bg-white border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Trust Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#f8fafc] text-[#181d26] border border-[#dddddd]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#08c068]" />
                  Professional Dental Care
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#f8fafc] text-[#181d26] border border-[#dddddd]">
                  <Users className="w-3.5 h-3.5 text-[#08c068]" />
                  Family-Friendly Services
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#f8fafc] text-[#181d26] border border-[#dddddd]">
                  <Clock className="w-3.5 h-3.5 text-[#08c068]" />
                  Convenient Appointment Requests
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#f8fafc] text-[#181d26] border border-[#dddddd]">
                  <MapPin className="w-3.5 h-3.5 text-[#08c068]" />
                  Kampala Clinic
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-[36px] sm:text-[44px] lg:text-[48px] font-normal leading-[1.12] text-[#181d26] tracking-tight">
                Confident Smiles Begin with Trusted Dental Care
              </h1>

              {/* Supporting Copy */}
              <p className="text-[16px] sm:text-[17px] text-[#333840] leading-relaxed max-w-xl">
                {CLINIC_NAME} provides professional general, cosmetic, restorative, orthodontic, and family dental care in Kampala. Request an appointment and our team will contact you to confirm a convenient time.
              </p>

              {/* CTA Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link href="/request-appointment" className="btn-primary group">
                  <Calendar className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  <span>{PRIMARY_CTA}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="btn-secondary group">
                  <Phone className="w-4 h-4 text-[#08c068] transition-transform duration-200 group-hover:scale-110" />
                  <span>{SECONDARY_CTA}</span>
                </a>
              </div>

              {/* Verified Rating Block (If enabled by admin, displays only confirmed label) */}
              {isRatingEnabled && (
                <div className="pt-4 flex items-center gap-2 text-[14px] text-[#181d26] font-medium">
                  <div className="flex text-amber-500">
                    {"★★★★★"}
                  </div>
                  <span>{ratingLabel}</span>
                </div>
              )}
            </div>

            {/* Right Visual Representation */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-[#dddddd] bg-[#f8fafc] overflow-hidden shadow-lg group">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src="/images/hero-clinic.jpg"
                    alt="Dr. Dental Crest Dental Surgery clinical consultation in Kampala"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Floating clinic badge */}
                  <div className="absolute bottom-4 inset-x-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/40 shadow-md flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#08c068] text-white flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-[#181d26]">
                          {CLINIC_NAME}
                        </div>
                        <div className="text-[12px] text-[#41454d] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#08c068]" />
                          <span>Kampala, Uganda · Led by {LEAD_SPECIALIST}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-3 bg-white border-t border-[#dddddd]">
                  <div className="flex items-center gap-3 text-[13px] text-[#333840]">
                    <CheckCircle2 className="w-4 h-4 text-[#08c068] shrink-0" />
                    <span>Direct personal consultations with experienced dental specialists</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px] text-[#333840]">
                    <CheckCircle2 className="w-4 h-4 text-[#08c068] shrink-0" />
                    <span>Simple online guest booking without login friction</span>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-[12px] text-[#41454d] border-t border-[#dddddd]">
                    <span>Emergency & Routine Care</span>
                    <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="font-medium text-[#08c068] hover:underline">
                      {CLINIC_PHONE}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST / WHY CHOOSE US SECTION */}
      <section className="section-rhythm bg-[#f8fafc] border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-[13px] font-semibold tracking-wider text-[#08c068] uppercase">
              Our Patient Philosophy
            </span>
            <h2 className="text-[32px] sm:text-[36px] font-normal text-[#181d26] tracking-tight">
              Dental Care Designed Around You
            </h2>
            <p className="text-[15px] text-[#41454d]">
              We believe in respectful, transparent, and gentle dental consultations designed around your individual well-being.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-lg border border-[#dddddd] flex flex-col justify-between space-y-4 shadow-sm card-interactive group">
              <div className="w-10 h-10 rounded-md bg-[#f8fafc] border border-[#dddddd] flex items-center justify-center text-[#08c068] transition-transform duration-200 group-hover:scale-110">
                <Smile className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-[16px] font-medium text-[#181d26]">Personalized Dental Care</h3>
                <p className="text-[13px] text-[#41454d] leading-relaxed">
                  Every consultation begins with listening carefully to your personal dental needs and comfort priorities.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#dddddd] flex flex-col justify-between space-y-4 shadow-sm card-interactive group">
              <div className="w-10 h-10 rounded-md bg-[#f8fafc] border border-[#dddddd] flex items-center justify-center text-[#08c068] transition-transform duration-200 group-hover:scale-110">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-[16px] font-medium text-[#181d26]">Experienced Dental Support</h3>
                <p className="text-[13px] text-[#41454d] leading-relaxed">
                  Attentive clinical guidance led by Dr. Silver, focused on gentle care and early prevention.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#dddddd] flex flex-col justify-between space-y-4 shadow-sm card-interactive group">
              <div className="w-10 h-10 rounded-md bg-[#f8fafc] border border-[#dddddd] flex items-center justify-center text-[#08c068] transition-transform duration-200 group-hover:scale-110">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-[16px] font-medium text-[#181d26]">Modern Treatment Approach</h3>
                <p className="text-[13px] text-[#41454d] leading-relaxed">
                  A calm, well-organized dental environment adhering to clean clinical healthcare practices.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#dddddd] flex flex-col justify-between space-y-4 shadow-sm card-interactive group">
              <div className="w-10 h-10 rounded-md bg-[#f8fafc] border border-[#dddddd] flex items-center justify-center text-[#08c068] transition-transform duration-200 group-hover:scale-110">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-[16px] font-medium text-[#181d26]">Family & Children’s Dentistry</h3>
                <p className="text-[13px] text-[#41454d] leading-relaxed">
                  A warm, welcoming setting where infants, children, and adults feel at ease in the dental chair.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#dddddd] flex flex-col justify-between space-y-4 shadow-sm card-interactive group">
              <div className="w-10 h-10 rounded-md bg-[#f8fafc] border border-[#dddddd] flex items-center justify-center text-[#08c068] transition-transform duration-200 group-hover:scale-110">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-[16px] font-medium text-[#181d26]">Convenient Requests</h3>
                <p className="text-[13px] text-[#41454d] leading-relaxed">
                  Simple guest appointment booking online with quick confirmation by our clinic staff.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SERVICES SECTION (Zero public prices!) */}
      <section className="section-rhythm bg-white border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3 max-w-xl">
              <span className="text-[13px] font-semibold tracking-wider text-[#08c068] uppercase">
                Clinical Expertise
              </span>
              <h2 className="text-[32px] sm:text-[36px] font-normal text-[#181d26] tracking-tight">
                Comprehensive Dental Services
              </h2>
              <p className="text-[15px] text-[#41454d]">
                From routine preventative check-ups to aesthetic smile refinements and restorative solutions in Kampala.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-[15px] font-medium text-[#181d26] hover:text-[#08c068] transition-colors"
            >
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRIMARY_SERVICES.map((s, idx) => (
              <div
                key={s.slug}
                className="group bg-white rounded-xl border border-[#dddddd] flex flex-col justify-between overflow-hidden shadow-sm card-interactive"
              >
                {/* Service Photo */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={s.imageUrl}
                    alt={s.imageAlt || s.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-[#08c068] border border-white/60">
                    Category 0{idx + 1}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-[18px] font-medium text-[#181d26] group-hover:text-[#08c068] transition-colors duration-200">
                      {s.name}
                    </h3>
                    <p className="text-[14px] text-[#41454d] leading-relaxed line-clamp-3">
                      {s.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#dddddd] flex items-center justify-between text-[14px]">
                    <Link
                      href={`/services/${s.slug}`}
                      className="font-medium text-[#1b61c9] hover:text-[#1a3866] flex items-center gap-1 group/link transition-colors duration-200"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
                    </Link>
                    <Link
                      href={`/request-appointment?service=${s.slug}`}
                      className="font-medium text-[#181d26] hover:text-[#08c068] transition-colors duration-200"
                    >
                      Request Visit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SIGNATURE FOREST CARD: CLINIC INTRODUCTION */}
      <section className="section-rhythm bg-white border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="bg-[#08c068] text-white rounded-xl p-8 sm:p-12 lg:p-16">
            <div className="max-w-3xl space-y-6">
              <span className="text-[12px] uppercase tracking-wider text-white/85 font-semibold">
                About Our Kampala Practice
              </span>
              <h2 className="text-[30px] sm:text-[38px] font-normal text-white leading-tight">
                Welcome to Dr. Dental Crest Dental Surgery
              </h2>
              <p className="text-[16px] text-white/95 leading-relaxed">
                {CLINIC_NAME} serves patients in Kampala with a welcoming approach to oral health, smile care, and dental treatment. Led by {LEAD_SPECIALIST}, the clinic offers a range of services for adults, children, and families.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link href="/about" className="btn-secondary-on-dark">
                  <span>Learn About Our Clinic</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/request-appointment"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg border border-white/40 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  <span>{PRIMARY_CTA}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LEAD DENTIST SECTION */}
      <section className="section-rhythm bg-white border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Lead specialist card */}
            <div className="lg:col-span-5">
              <div className="bg-[#f8fafc] border border-[#dddddd] rounded-xl p-8 text-center space-y-5 card-interactive">
                <div className="relative w-28 h-28 mx-auto rounded-2xl overflow-hidden shadow-md border-2 border-white ring-1 ring-[#e2e8f0]">
                  <Image
                    src="/images/dr-silver-portrait.jpg"
                    alt={`${LEAD_SPECIALIST} - Lead Dental Specialist`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-[22px] font-medium text-[#181d26]">
                    {LEAD_SPECIALIST}
                  </h3>
                  <p className="text-[14px] text-[#08c068] font-medium">
                    Lead Dental Specialist
                  </p>
                  <p className="text-[13px] text-[#41454d]">
                    Dr. Dental Crest Dental Surgery · Kampala
                  </p>
                </div>
                <div className="pt-3 border-t border-[#dddddd] text-left text-[13px] text-[#41454d] space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#08c068] shrink-0" />
                    <span>General Dentistry & Preventive Check-Ups</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#08c068] shrink-0" />
                    <span>Cosmetic Smile Consultations & Veneers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#08c068] shrink-0" />
                    <span>Orthodontics & Restorative Implants</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead specialist copy */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[13px] font-semibold tracking-wider text-[#08c068] uppercase">
                Clinical Leadership
              </span>
              <h2 className="text-[32px] sm:text-[36px] font-normal text-[#181d26] tracking-tight">
                Meet Dr. Silver
              </h2>
              <p className="text-[16px] text-[#333840] leading-relaxed">
                {LEAD_SPECIALIST} leads the dental care team at {CLINIC_NAME}. Learn more about the clinic’s approach to general dentistry, cosmetic treatments, orthodontics, restorative care, and family-focused appointments.
              </p>
              <p className="text-[14px] text-[#41454d] leading-relaxed">
                Our approach emphasizes patient communication, clear clinical explanations, and a gentle touch for adults and children throughout Kampala.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link href="/request-appointment" className="btn-primary group">
                  <Calendar className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  <span>Request an Appointment with {LEAD_SPECIALIST}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link href="/dentists" className="btn-secondary group">
                  <span>View Dental Profile</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SIGNATURE CREAM CALLOUT: APPOINTMENT CTA */}
      <section className="section-rhythm bg-white border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="bg-[#f5e9d4] border border-[#d9a441]/40 rounded-xl p-8 sm:p-12 text-[#181d26] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#aa2d00]">
                Simple & Direct Booking
              </span>
              <h2 className="text-[28px] sm:text-[34px] font-normal leading-tight">
                Request Your Dental Appointment
              </h2>
              <p className="text-[15px] text-[#333840] leading-relaxed">
                Tell us the service you need and your preferred time. Our clinic team will review your request and contact you to confirm your appointment.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link href="/request-appointment" className="btn-primary justify-center group">
                <Calendar className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                <span>{PRIMARY_CTA}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="btn-secondary justify-center group">
                <Phone className="w-4 h-4 text-[#08c068] transition-transform duration-200 group-hover:scale-110" />
                <span>Call {CLINIC_PHONE}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ PREVIEW SECTION */}
      <section className="section-rhythm bg-[#f8fafc] border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-[13px] font-semibold tracking-wider text-[#08c068] uppercase">
              Common Questions
            </span>
            <h2 className="text-[32px] sm:text-[36px] font-normal text-[#181d26] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-[15px] text-[#41454d]">
              Helpful answers about visiting our clinic and requesting your appointment.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <FaqAccordion faqs={faqs} defaultOpenIndex={0} />
          </div>

          <div className="text-center mt-10">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-[15px] font-medium text-[#181d26] hover:text-[#08c068]"
            >
              <span>View All Frequently Asked Questions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. SIGNATURE ACCENT CARD: CONTACT / LOCATION CTA */}
      <section className="section-rhythm bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="bg-[#08c068] text-white rounded-xl p-8 sm:p-12 lg:p-16 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <span className="text-[12px] uppercase tracking-wider text-white/85 font-semibold">
                  Get in Touch
                </span>
                <h2 className="text-[30px] sm:text-[36px] font-normal text-white">
                  Contact {CLINIC_NAME}
                </h2>
                <div className="space-y-3 pt-2 text-[15px] text-white/95">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-white/90 shrink-0" />
                    <span>{SAFE_DIRECTIONS_NOTICE}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#a8d8c4] shrink-0" />
                    <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="hover:underline">
                      {CLINIC_PHONE}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:justify-end gap-4">
                <Link href="/request-appointment" className="btn-secondary-on-dark justify-center group">
                  <Calendar className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  <span>{PRIMARY_CTA}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <a
                  href={`tel:${CLINIC_PHONE_DIGITS}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-white/40 text-white font-medium hover:bg-white/10 hover:border-white/70 transition-all duration-200 group"
                >
                  <Phone className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  <span>Call Our Clinic</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
