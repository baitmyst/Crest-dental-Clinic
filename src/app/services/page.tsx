import Link from "next/link";
import { ArrowRight, Calendar, Phone, CheckCircle2, ShieldCheck, Sparkles, Smile, Users, HeartPulse } from "lucide-react";
import {
  CLINIC_NAME,
  CLINIC_CITY,
  CLINIC_PHONE,
  CLINIC_PHONE_DIGITS,
  PRIMARY_CTA,
  SECONDARY_CTA,
  PRIMARY_SERVICES,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Dental Services in Kampala | Dr. Dental Crest Dental Surgery",
  description:
    "Explore comprehensive dental care services in Kampala: General dentistry, cosmetic veneers, restorative implants, pediatric care, and orthodontics.",
};

export default async function ServicesPage() {
  let services: any[] = [];
  try {
    services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
  } catch {
    // fallback
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="section-rhythm bg-white border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-6">
            <span className="text-[13px] font-semibold tracking-wider text-[#0a2e0e] uppercase">
              Our Dental Services
            </span>
            <h1 className="text-[36px] sm:text-[44px] font-normal text-[#181d26] tracking-tight leading-tight">
              Comprehensive Dental Care for You & Your Family
            </h1>
            <p className="text-[17px] text-[#333840] leading-relaxed">
              At {CLINIC_NAME} in Kampala, we provide tailored dental assessments and treatments ranging from preventive maintenance to complex restorative and cosmetic care.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link href="/request-appointment" className="btn-primary">
                <Calendar className="w-4 h-4" />
                <span>{PRIMARY_CTA}</span>
              </Link>
              <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="btn-secondary">
                <Phone className="w-4 h-4 text-[#0a2e0e]" />
                <span>{SECONDARY_CTA}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="section-rhythm bg-[#f8fafc] border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="space-y-8">
            {(services.length > 0 ? services : PRIMARY_SERVICES).map((service: any, idx: number) => {
              let benefits: string[] = [];
              try {
                benefits = JSON.parse(service.benefits || "[]");
              } catch {
                benefits = [];
              }

              return (
                <div
                  key={service.slug}
                  className="bg-white rounded-xl border border-[#dddddd] p-8 lg:p-10 shadow-sm"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#f8fafc] border border-[#dddddd] flex items-center justify-center text-[#0a2e0e]">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="text-[13px] font-semibold text-[#0a2e0e] tracking-wider uppercase">
                          Service Category 0{idx + 1}
                        </span>
                      </div>
                      <h2 className="text-[24px] sm:text-[28px] font-medium text-[#181d26]">
                        {service.name}
                      </h2>
                      <p className="text-[15px] text-[#41454d] leading-relaxed">
                        {service.shortDescription || service.summary}
                      </p>

                      {benefits.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {benefits.slice(0, 4).map((b, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-2 text-[13px] text-[#333840]">
                              <CheckCircle2 className="w-4 h-4 text-[#0a2e0e] shrink-0" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-4 lg:border-l lg:border-[#dddddd] lg:pl-8 space-y-4 flex flex-col justify-between h-full pt-4 lg:pt-0">
                      <div className="space-y-2">
                        <span className="text-[12px] font-semibold tracking-wider text-[#41454d] uppercase">
                          Consultation Process
                        </span>
                        <p className="text-[13px] text-[#41454d]">
                          Detailed diagnostic assessment with Dr. Silver followed by an individualized care discussion.
                        </p>
                      </div>

                      <div className="space-y-2.5 pt-4">
                        <Link
                          href={`/services/${service.slug}`}
                          className="btn-primary w-full justify-center text-[14px] py-2.5"
                        >
                          <span>Explore Treatment Details</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/request-appointment?service=${service.slug}`}
                          className="btn-secondary w-full justify-center text-[14px] py-2.5"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Request an Appointment</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Signature Forest CTA */}
      <section className="section-rhythm bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="bg-[#0a2e0e] text-white rounded-xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6">
            <h2 className="text-[30px] sm:text-[36px] font-normal leading-tight">
              Looking for Personalized Dental Advice?
            </h2>
            <p className="text-[16px] text-gray-200">
              Not sure which treatment fits your oral health goals? Request a dental consultation and our team will guide you.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/request-appointment" className="btn-secondary-on-dark">
                <Calendar className="w-4 h-4" />
                <span>Arrange a Consultation</span>
              </Link>
              <a
                href={`tel:${CLINIC_PHONE_DIGITS}`}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg border border-white/40 text-white font-medium hover:bg-white/10 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Speak With Our Dental Team</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
