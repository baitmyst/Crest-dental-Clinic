import Link from "next/link";
import Image from "next/image";
import { Calendar, Phone, ArrowRight, ShieldCheck, CheckCircle2, User } from "lucide-react";
import {
  CLINIC_NAME,
  CLINIC_PHONE,
  CLINIC_PHONE_DIGITS,
  LEAD_SPECIALIST,
  PRIMARY_CTA,
  SECONDARY_CTA,
  PRIMARY_SERVICES,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Meet Our Dentist | Dr. Dental Crest Dental Surgery",
  description:
    "Meet Dr. Silver, Lead Dental Specialist at Dr. Dental Crest Dental Surgery in Kampala, Uganda.",
};

export default async function DentistsPage() {
  let dentistProfile = null;
  try {
    dentistProfile = await prisma.dentistProfile.findFirst({
      include: { user: true },
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
            <span className="text-[13px] font-semibold tracking-wider text-[#08c068] uppercase">
              Dental Team
            </span>
            <h1 className="text-[36px] sm:text-[44px] font-normal text-[#181d26] tracking-tight leading-tight">
              Experienced, Caring Dental Leadership in Kampala
            </h1>
            <p className="text-[17px] text-[#333840] leading-relaxed">
              At {CLINIC_NAME}, our clinical practice is guided by patient-centered care, gentle communication, and dedicated oral health treatment.
            </p>
          </div>
        </div>
      </section>

      {/* Specialist Profile Section */}
      <section className="section-rhythm bg-[#f8fafc] border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-xl border border-[#dddddd] p-8 lg:p-12 shadow-sm max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4 flex justify-center">
                <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-lg border-2 border-white ring-1 ring-[#e2e8f0]">
                  <Image
                    src="/images/dr-silver-portrait.jpg"
                    alt={`${LEAD_SPECIALIST} - Lead Dental Specialist`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="md:col-span-8 space-y-4">
                <div>
                  <span className="text-[12px] font-semibold tracking-wider text-[#08c068] uppercase">
                    Lead Dental Specialist
                  </span>
                  <h2 className="text-[28px] font-medium text-[#181d26]">
                    {LEAD_SPECIALIST}
                  </h2>
                  <p className="text-[14px] text-[#41454d]">
                    Dr. Dental Crest Dental Surgery · Kampala, Uganda
                  </p>
                </div>

                <p className="text-[15px] text-[#333840] leading-relaxed">
                  {dentistProfile?.biography ||
                    `${LEAD_SPECIALIST} leads the dental care team at ${CLINIC_NAME}. Learn more about the clinic’s approach to general dentistry, cosmetic treatments, orthodontics, restorative care, and family-focused appointments.`}
                </p>

                <div className="pt-2 border-t border-[#dddddd]">
                  <h4 className="text-[13px] font-semibold text-[#181d26] uppercase mb-2">
                    Services Offered
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] text-[#333840]">
                    {PRIMARY_SERVICES.map((s) => (
                      <div key={s.slug} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#08c068] shrink-0" />
                        <span>{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-3">
                  <Link
                    href="/dentists/dr-silver"
                    className="btn-primary text-[14px] py-2.5 px-4"
                  >
                    <span>View Full Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/request-appointment"
                    className="btn-secondary text-[14px] py-2.5 px-4"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Request an Appointment</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Forest CTA */}
      <section className="section-rhythm bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="bg-[#08c068] text-white rounded-xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6 shadow-lg">
            <h2 className="text-[30px] font-normal leading-tight text-white">
              Schedule Your Dental Consultation with {LEAD_SPECIALIST}
            </h2>
            <p className="text-[16px] text-white/95">
              Submit your preferred date and time online. Our clinic team will call you to confirm your visit.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/request-appointment" className="btn-secondary-on-dark">
                <Calendar className="w-4 h-4" />
                <span>{PRIMARY_CTA}</span>
              </Link>
              <a
                href={`tel:${CLINIC_PHONE_DIGITS}`}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg border border-white/40 text-white font-medium hover:bg-white/10 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{SECONDARY_CTA}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
