import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  HeartHandshake,
  Users,
  Sparkles,
  Calendar,
  Phone,
  ArrowRight,
  CheckCircle2,
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
} from "@/lib/constants";

export const metadata = {
  title: "About Us | Dr. Dental Crest Dental Surgery",
  description:
    "Learn about Dr. Dental Crest Dental Surgery in Kampala, Uganda. Led by Dr. Silver, providing trusted general, cosmetic, restorative, orthodontic, and family dental care.",
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Band */}
      <section className="section-rhythm bg-white border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-6">
            <span className="text-[13px] font-semibold tracking-wider text-[#0284c7] uppercase">
              About Our Clinic
            </span>
            <h1 className="text-[36px] sm:text-[44px] font-normal text-[#181d26] tracking-tight leading-tight">
              Gentle, Patient-Centered Dental Care in Kampala
            </h1>
            <p className="text-[17px] text-[#333840] leading-relaxed">
              {CLINIC_NAME} is a Kampala-based dental clinic committed to helping individuals and families care for their oral health with confidence. The clinic provides general dentistry, cosmetic dental treatments, orthodontics, implants and prosthetic consultations, and children’s dentistry.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link href="/request-appointment" className="btn-primary">
                <Calendar className="w-4 h-4" />
                <span>{PRIMARY_CTA}</span>
              </Link>
              <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="btn-secondary">
                <Phone className="w-4 h-4 text-[#0284c7]" />
                <span>{SECONDARY_CTA}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="section-rhythm bg-[#f8fafc] border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg border border-[#dddddd] space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-[18px] font-medium text-[#181d26]">
                Our Clinical Mission
              </h3>
              <p className="text-[14px] text-[#41454d] leading-relaxed">
                To provide thorough, compassionate dental consultations and preventive oral health care that respects every patient’s comfort and well-being.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-[#dddddd] space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7]">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-[18px] font-medium text-[#181d26]">
                Patient-First Values
              </h3>
              <p className="text-[14px] text-[#41454d] leading-relaxed">
                Clear communication, honest explanations, and a gentle touch. We ensure you feel informed and supported at every stage of your dental journey.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-[#dddddd] space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7]">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-[18px] font-medium text-[#181d26]">
                All-Ages Care
              </h3>
              <p className="text-[14px] text-[#41454d] leading-relaxed">
                From introducing infants and young children to positive dental visits, to adult aesthetic refinements and restorative care for seniors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Forest Card: Lead Specialist */}
      <section className="section-rhythm bg-white border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="bg-[#08c068] text-white rounded-xl p-8 sm:p-12 lg:p-16 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-6">
                <span className="text-[12px] uppercase tracking-wider text-white/85 font-semibold">
                  Clinical Leadership
                </span>
                <h2 className="text-[32px] sm:text-[38px] font-normal leading-tight text-white">
                  Meet {LEAD_SPECIALIST}
                </h2>
                <p className="text-[16px] text-white/95 leading-relaxed">
                  {LEAD_SPECIALIST} leads the dental care team at {CLINIC_NAME}. Learn more about the clinic’s approach to general dentistry, cosmetic treatments, orthodontics, restorative care, and family-focused appointments.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[14px] text-white/95">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>General Dentistry & Check-Ups</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Cosmetic Smile Care & Veneers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Dental Implants & Restorative</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Children’s Gentle Dentistry</span>
                  </div>
                </div>
                <div className="pt-4 flex flex-wrap gap-4">
                  <Link href="/request-appointment" className="btn-secondary-on-dark">
                    <span>Request an Appointment with {LEAD_SPECIALIST}</span>
                  </Link>
                  <Link href="/dentists" className="inline-flex items-center text-white/90 hover:text-white underline font-medium text-[15px]">
                    <span>View Specialist Roster &rarr;</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30 ring-1 ring-white/10">
                  <Image
                    src="/images/dr-silver-portrait.jpg"
                    alt={`${LEAD_SPECIALIST} - Lead Dental Specialist`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinic Environment & Standards */}
      <section className="section-rhythm bg-white border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-[13px] font-semibold tracking-wider text-[#0284c7] uppercase">
              Our Practice Environment
            </span>
            <h2 className="text-[32px] sm:text-[36px] font-normal text-[#181d26] tracking-tight">
              Calm, Hygienic, and Welcoming
            </h2>
            <p className="text-[15px] text-[#41454d]">
              We aim to make your clinic visit relaxing and comfortable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-[#dddddd] rounded-lg p-6 bg-[#f8fafc] space-y-3">
              <h3 className="text-[16px] font-medium text-[#181d26]">
                Clean Clinical Standards
              </h3>
              <p className="text-[13px] text-[#41454d] leading-relaxed">
                We strictly observe healthcare hygiene and sanitation protocols for dental instruments, treatment rooms, and patient contact surfaces.
              </p>
            </div>
            <div className="border border-[#dddddd] rounded-lg p-6 bg-[#f8fafc] space-y-3">
              <h3 className="text-[16px] font-medium text-[#181d26]">
                Respectful Communication
              </h3>
              <p className="text-[13px] text-[#41454d] leading-relaxed">
                We take the time to listen to your concerns, review treatment options without pressure, and ensure you feel in control of your care.
              </p>
            </div>
            <div className="border border-[#dddddd] rounded-lg p-6 bg-[#f8fafc] space-y-3">
              <h3 className="text-[16px] font-medium text-[#181d26]">
                Accessible Kampala Location
              </h3>
              <p className="text-[13px] text-[#41454d] leading-relaxed">
                Conveniently situated in Kampala with dedicated phone support to guide you directly to our clinic doors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment CTA */}
      <section className="section-rhythm bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-[32px] font-normal text-[#181d26]">
            Ready to Speak with Our Dental Team?
          </h2>
          <p className="text-[16px] text-[#41454d] max-w-xl mx-auto">
            Submit a quick guest appointment request and our team will get in touch to confirm your visit.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/request-appointment" className="btn-primary">
              <Calendar className="w-4 h-4" />
              <span>{PRIMARY_CTA}</span>
            </Link>
            <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="btn-secondary">
              <Phone className="w-4 h-4 text-[#0284c7]" />
              <span>{SECONDARY_CTA}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
