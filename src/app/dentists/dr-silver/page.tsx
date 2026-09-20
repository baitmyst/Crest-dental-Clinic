import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
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
import { getDentists } from "@/services/staff";

export const metadata = {
  title: `${LEAD_SPECIALIST} - Lead Dental Specialist | ${CLINIC_NAME}`,
  description: `Learn about ${LEAD_SPECIALIST}, Lead Specialist at ${CLINIC_NAME} in Kampala. General, cosmetic, restorative, and pediatric dentistry.`,
};

export default async function DrSilverProfilePage() {
  const dentists = await getDentists();
  const profile = dentists.length > 0 ? dentists[0] : null;

  return (
    <div className="bg-white">
      {/* Header Band */}
      <section className="section-rhythm bg-white border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-2xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-[#e2e8f0]">
                <Image
                  src="/images/dr-silver-portrait.jpg"
                  alt={`${LEAD_SPECIALIST} - Lead Dental Specialist at ${CLINIC_NAME}`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="lg:col-span-8 space-y-5">
              <div>
                <span className="text-[13px] font-semibold tracking-wider text-[#0284c7] uppercase">
                  Lead Dental Specialist
                </span>
                <h1 className="text-[36px] sm:text-[42px] font-normal text-[#181d26] tracking-tight leading-tight">
                  {LEAD_SPECIALIST}
                </h1>
                <p className="text-[16px] text-[#41454d]">
                  {CLINIC_NAME} · {CLINIC_CITY}
                </p>
              </div>

              <p className="text-[16px] text-[#333840] leading-relaxed">
                {profile?.biography ||
                  `${LEAD_SPECIALIST} leads the dental care team at ${CLINIC_NAME}. Learn more about the clinic’s approach to general dentistry, cosmetic treatments, orthodontics, restorative care, and family-focused appointments.`}
              </p>

              {/* Show only confirmed fields */}
              {profile?.qualifications && (
                <div className="p-3 bg-[#f8fafc] rounded-lg border border-[#dddddd] text-[14px]">
                  <span className="font-medium text-[#181d26]">Qualifications:</span>{" "}
                  <span className="text-[#41454d]">{profile.qualifications}</span>
                </div>
              )}

              {profile?.languages && (
                <div className="p-3 bg-[#f8fafc] rounded-lg border border-[#dddddd] text-[14px]">
                  <span className="font-medium text-[#181d26]">Languages Spoken:</span>{" "}
                  <span className="text-[#41454d]">{profile.languages}</span>
                </div>
              )}

              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/request-appointment?dentist=dr-silver"
                  className="btn-primary"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Request an Appointment with {LEAD_SPECIALIST}</span>
                </Link>
                <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="btn-secondary">
                  <Phone className="w-4 h-4 text-[#0284c7]" />
                  <span>Call {CLINIC_PHONE}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Associated */}
      <section className="section-rhythm bg-[#f8fafc] border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <span className="text-[13px] font-semibold tracking-wider text-[#0284c7] uppercase">
              Areas of Dental Practice
            </span>
            <h2 className="text-[30px] font-normal text-[#181d26] tracking-tight mt-1">
              Treatments Provided by {LEAD_SPECIALIST}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRIMARY_SERVICES.map((s) => (
              <div
                key={s.slug}
                className="bg-white p-6 rounded-lg border border-[#dddddd] space-y-3 flex flex-col justify-between card-interactive"
              >
                <div className="space-y-2">
                  <h3 className="text-[18px] font-medium text-[#181d26]">
                    {s.name}
                  </h3>
                  <p className="text-[14px] text-[#41454d] leading-relaxed">
                    {s.summary}
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-[#dddddd] text-[13px]">
                  <Link
                    href={`/services/${s.slug}`}
                    className="font-medium text-[#0284c7] hover:text-[#0369a1]"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/request-appointment?service=${s.slug}&dentist=dr-silver`}
                    className="font-medium text-[#181d26] hover:text-[#0284c7]"
                  >
                    Book with Dr. Silver
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Forest CTA */}
      <section className="section-rhythm bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="bg-[#08c068] text-white rounded-xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6 shadow-lg">
            <h2 className="text-[30px] font-normal leading-tight text-white">
              Begin Your Smile Journey
            </h2>
            <p className="text-[16px] text-white/95">
              Submit your appointment request online without account registration. Our clinic team will call you to confirm your consultation time.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/request-appointment?dentist=dr-silver"
                className="btn-secondary-on-dark"
              >
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
