import Link from "next/link";
import { HelpCircle, Calendar, Phone, ArrowRight } from "lucide-react";
import {
  CLINIC_NAME,
  CLINIC_PHONE,
  CLINIC_PHONE_DIGITS,
  PRIMARY_CTA,
  SECONDARY_CTA,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Frequently Asked Questions | Dr. Dental Crest Dental Surgery",
  description:
    "Common questions about requesting an appointment, visiting our Kampala clinic, and general dental consultations at Dr. Dental Crest Dental Surgery.",
};

export default async function FaqPage() {
  let faqs = [];
  try {
    faqs = await prisma.faq.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: "asc" },
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
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-[#dddddd] p-6 space-y-2.5 shadow-sm"
              >
                <h3 className="text-[17px] font-medium text-[#181d26] flex items-center gap-2.5">
                  <HelpCircle className="w-5 h-5 text-[#0a2e0e] shrink-0" />
                  <span>{faq.question}</span>
                </h3>
                <p className="text-[14px] text-[#41454d] leading-relaxed pl-7">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
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
      </section>
    </div>
  );
}
