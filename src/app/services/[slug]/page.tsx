import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Phone,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Clock,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import {
  CLINIC_NAME,
  CLINIC_CITY,
  CLINIC_PHONE,
  CLINIC_PHONE_DIGITS,
  LEAD_SPECIALIST,
  PRIMARY_CTA,
  SECONDARY_CTA,
  PRIMARY_SERVICES,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service) return { title: "Service Not Found" };

  return {
    title: `${service.seoTitle || service.name} | ${CLINIC_NAME}`,
    description: service.seoDescription || service.shortDescription,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug },
  });

  if (!service) {
    notFound();
  }

  let benefits: string[] = [];
  try {
    benefits = JSON.parse(service.benefits || "[]");
  } catch {
    benefits = [];
  }

  let treatmentSteps: Array<{ step: string; desc: string }> = [];
  try {
    treatmentSteps = JSON.parse(service.treatmentProcess || "[]");
  } catch {
    treatmentSteps = [];
  }

  let faqs: Array<{ q: string; a: string }> = [];
  try {
    faqs = JSON.parse(service.faqContent || "[]");
  } catch {
    faqs = [];
  }

  const relatedServices = PRIMARY_SERVICES.filter((s) => s.slug !== slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.shortDescription,
    provider: {
      "@type": "Dentist",
      name: CLINIC_NAME,
      telephone: CLINIC_PHONE,
    },
    areaServed: CLINIC_CITY,
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Header */}
      <div className="bg-[#f8fafc] border-b border-[#dddddd] py-3 px-4 sm:px-6">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2 text-[13px] text-[#41454d]">
          <Link href="/" className="hover:text-[#181d26]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/services" className="hover:text-[#181d26]">Services</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[#181d26] font-medium">{service.name}</span>
        </div>
      </div>

      {/* Service Hero */}
      <section className="section-rhythm bg-white border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-6">
              <span className="text-[13px] font-semibold tracking-wider text-[#0a2e0e] uppercase">
                {service.category} Dentistry · Kampala
              </span>
              <h1 className="text-[34px] sm:text-[42px] font-normal text-[#181d26] tracking-tight leading-tight">
                {service.name}
              </h1>
              <p className="text-[17px] text-[#333840] leading-relaxed">
                {service.fullDescription || service.shortDescription}
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href={`/request-appointment?service=${service.slug}`}
                  className="btn-primary"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Arrange a Consultation</span>
                </Link>
                <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="btn-secondary">
                  <Phone className="w-4 h-4 text-[#0a2e0e]" />
                  <span>Call {CLINIC_PHONE}</span>
                </a>
              </div>
            </div>

            {/* Quick Consultation Overview Card */}
            <div className="lg:col-span-4">
              <div className="bg-[#f8fafc] border border-[#dddddd] rounded-xl p-6 sm:p-7 space-y-5">
                <h3 className="text-[18px] font-medium text-[#181d26]">
                  Consultation Overview
                </h3>
                <div className="space-y-3 text-[14px]">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#dddddd]">
                    <span className="text-[#41454d]">Lead Dentist:</span>
                    <span className="font-medium text-[#181d26]">{LEAD_SPECIALIST}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#dddddd]">
                    <span className="text-[#41454d]">Estimated Duration:</span>
                    <span className="font-medium text-[#181d26]">{service.durationMinutes} minutes</span>
                  </div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#dddddd]">
                    <span className="text-[#41454d]">Location:</span>
                    <span className="font-medium text-[#181d26]">Kampala Clinic</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#41454d]">Booking Mode:</span>
                    <span className="font-medium text-[#0a2e0e]">Online Guest Request</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/request-appointment?service=${service.slug}`}
                    className="btn-primary w-full justify-center text-[14px]"
                  >
                    <span>Request an Appointment</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits & Who This Is For */}
      <section className="section-rhythm bg-[#f8fafc] border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Benefits */}
            <div className="bg-white p-8 rounded-xl border border-[#dddddd] space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#f8fafc] border border-[#dddddd] flex items-center justify-center text-[#0a2e0e]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-[22px] font-medium text-[#181d26]">
                  Key Treatment Benefits
                </h2>
              </div>
              <ul className="space-y-3.5 pt-2">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[14px] text-[#333840]">
                    <CheckCircle2 className="w-4 h-4 text-[#0a2e0e] shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Who is it for */}
            <div className="bg-white p-8 rounded-xl border border-[#dddddd] space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#f8fafc] border border-[#dddddd] flex items-center justify-center text-[#0a2e0e]">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h2 className="text-[22px] font-medium text-[#181d26]">
                  Who This Service is Suitable For
                </h2>
              </div>
              <p className="text-[14px] text-[#41454d] leading-relaxed">
                Whether you are seeking preventative care, resolving dental discomfort, or planning an aesthetic smile transformation in Kampala, our consultations offer personalized clinical evaluation tailored to your oral health history.
              </p>
              <div className="pt-2 space-y-2.5 text-[14px] text-[#333840]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0a2e0e] shrink-0" />
                  <span>Patients seeking gentle, transparent advice</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0a2e0e] shrink-0" />
                  <span>Individuals wanting proactive prevention</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0a2e0e] shrink-0" />
                  <span>Families scheduling visits for multiple members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Treatment Journey */}
      {treatmentSteps.length > 0 && (
        <section className="section-rhythm bg-white border-b border-[#dddddd]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <span className="text-[13px] font-semibold tracking-wider text-[#0a2e0e] uppercase">
                Patient Experience
              </span>
              <h2 className="text-[30px] sm:text-[34px] font-normal text-[#181d26] tracking-tight">
                What to Expect: Your Treatment Journey
              </h2>
              <p className="text-[15px] text-[#41454d]">
                Clear and respectful steps from your initial request to continuous smile care.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {treatmentSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-[#f8fafc] border border-[#dddddd] p-6 rounded-lg space-y-3 relative"
                >
                  <div className="w-8 h-8 rounded-full bg-[#181d26] text-white flex items-center justify-center font-medium text-[13px]">
                    0{idx + 1}
                  </div>
                  <h3 className="text-[16px] font-medium text-[#181d26]">
                    {step.step}
                  </h3>
                  <p className="text-[13px] text-[#41454d] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Service FAQs */}
      {faqs.length > 0 && (
        <section className="section-rhythm bg-[#f8fafc] border-b border-[#dddddd]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 max-w-3xl">
            <div className="text-center space-y-3 mb-10">
              <h2 className="text-[28px] font-normal text-[#181d26]">
                Frequently Asked Questions About {service.name}
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-lg border border-[#dddddd] space-y-2 shadow-sm"
                >
                  <h3 className="text-[15px] font-medium text-[#181d26] flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#0a2e0e] shrink-0" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-[14px] text-[#41454d] pl-6 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Services */}
      <section className="section-rhythm bg-white border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[24px] font-normal text-[#181d26]">
              Related Dental Services
            </h2>
            <Link
              href="/services"
              className="text-[14px] font-medium text-[#1b61c9] hover:text-[#1a3866] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedServices.map((rel) => (
              <div
                key={rel.slug}
                className="bg-[#f8fafc] border border-[#dddddd] p-6 rounded-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h3 className="text-[17px] font-medium text-[#181d26]">
                    {rel.name}
                  </h3>
                  <p className="text-[13px] text-[#41454d] leading-relaxed">
                    {rel.summary}
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    href={`/services/${rel.slug}`}
                    className="text-[13px] font-medium text-[#181d26] hover:text-[#0a2e0e] flex items-center gap-1"
                  >
                    <span>Read Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Cream CTA */}
      <section className="section-rhythm bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="bg-[#f5e9d4] border border-[#d9a441]/40 rounded-xl p-8 sm:p-12 text-[#181d26] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#aa2d00]">
                Schedule an Assessment
              </span>
              <h2 className="text-[28px] font-normal">
                Ready for Your Dental Consultation?
              </h2>
              <p className="text-[15px] text-[#333840]">
                Speak with our dental team or submit an appointment request. We will contact you directly to confirm a convenient appointment time.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link
                href={`/request-appointment?service=${service.slug}`}
                className="btn-primary justify-center"
              >
                <Calendar className="w-4 h-4" />
                <span>Request an Appointment</span>
              </Link>
              <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="btn-secondary justify-center">
                <Phone className="w-4 h-4 text-[#0a2e0e]" />
                <span>{SECONDARY_CTA}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
