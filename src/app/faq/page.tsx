import Link from "next/link";
import { HelpCircle, Calendar, Phone, ArrowRight } from "lucide-react";
import FaqAccordion from "@/components/ui/FaqAccordion";
import {
  CLINIC_NAME,
  CLINIC_PHONE,
  CLINIC_PHONE_DIGITS,
  PRIMARY_CTA,
  SECONDARY_CTA,
} from "@/lib/constants";
import { getFaqs } from "@/lib/admin-data";

export const metadata = {
  title: "Frequently Asked Questions | Dr. Dental Crest Dental Surgery",
  description:
    "Common questions about requesting an appointment, visiting our Kampala clinic, and general dental consultations at Dr. Dental Crest Dental Surgery.",
};

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="section-rhythm bg-white border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-6">
            <span className="text-[13px] font-semibold tracking-wider text-[#0284c7] uppercase">
              Help & Answers
            </span>
            <h1 className="text-[36px] sm:text-[44px] font-normal text-[#181d26] tracking-tight leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-[17px] text-[#333840] leading-relaxed">
              Find answers regarding guest appointment requests, clinic visit preparations, and services at {CLINIC_NAME} in Kampala.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs List */}
      <section className="section-rhythm bg-[#f8fafc] border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 max-w-3xl">
          <FaqAccordion faqs={faqs} defaultOpenIndex={0} />
        </div>
      </section>

      {/* CTA */}
      <section className="section-rhythm bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-[30px] font-normal text-[#181d26]">
            Have a Question Not Answered Here?
          </h2>
          <p className="text-[16px] text-[#41454d] max-w-lg mx-auto">
            Our clinic staff is ready to help you with directions, consultations, or scheduling inquiries.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
        </div>
      </section>
    </div>
  );
}
