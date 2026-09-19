import Link from "next/link";
import { CLINIC_NAME, CLINIC_CITY, CLINIC_PHONE } from "@/lib/constants";

export const metadata = {
  title: "Privacy Policy | Dr. Dental Crest Dental Surgery",
  description: "Privacy policy and patient data confidentiality standards at Dr. Dental Crest Dental Surgery in Kampala.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8 text-[#333840]">
        <div className="space-y-3 pb-6 border-b border-[#dddddd]">
          <span className="text-[12px] font-semibold tracking-wider text-[#0a2e0e] uppercase">
            Legal & Compliance
          </span>
          <h1 className="text-[32px] sm:text-[38px] font-normal text-[#181d26] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-[14px] text-[#41454d]">
            Last updated: September 2026 · {CLINIC_NAME} ({CLINIC_CITY})
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-[20px] font-medium text-[#181d26]">1. Overview</h2>
          <p className="text-[15px] leading-relaxed">
            {CLINIC_NAME} is committed to respecting the privacy and confidentiality of visitors and patients. This Privacy Policy explains what details we collect when you submit an appointment request or contact inquiry through our website.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[20px] font-medium text-[#181d26]">2. No Patient Account Creation</h2>
          <p className="text-[15px] leading-relaxed">
            Our public website does not require or allow patient account creation or public client sign-in. All booking requests and contact inquiries are handled as secure guest submissions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[20px] font-medium text-[#181d26]">3. Information Collected</h2>
          <p className="text-[15px] leading-relaxed">
            When you submit an appointment request or message, we collect your name, phone number, email address, preferred appointment date, and any optional message you provide. This information is used strictly to coordinate, schedule, and confirm your clinic consultation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[20px] font-medium text-[#181d26]">4. Confidentiality & Security</h2>
          <p className="text-[15px] leading-relaxed">
            Patient contact records are accessible only to authorized internal clinic staff (administrators, receptionists, and dentists assigned to your care). We never sell, rent, or publicly disclose patient information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[20px] font-medium text-[#181d26]">5. Contact Us Regarding Your Data</h2>
          <p className="text-[15px] leading-relaxed">
            If you have questions about your stored contact information, please call our clinic at {CLINIC_PHONE} or submit a message through our <Link href="/contact" className="text-[#1b61c9] underline">Contact Form</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
