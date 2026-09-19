import Link from "next/link";
import { CLINIC_NAME } from "@/lib/constants";

export const metadata = {
  title: "Cookie Policy | Dr. Dental Crest Dental Surgery",
  description: "Information regarding cookie usage and website performance.",
};

export default function CookiePolicyPage() {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8 text-[#333840]">
        <div className="space-y-3 pb-6 border-b border-[#dddddd]">
          <span className="text-[12px] font-semibold tracking-wider text-[#0a2e0e] uppercase">
            Privacy & Policies
          </span>
          <h1 className="text-[32px] sm:text-[38px] font-normal text-[#181d26] tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-[14px] text-[#41454d]">
            {CLINIC_NAME} · Kampala, Uganda
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-[20px] font-medium text-[#181d26]">What Are Cookies?</h2>
          <p className="text-[15px] leading-relaxed">
            Cookies are small text files stored on your browser to support essential website operation and navigation security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[20px] font-medium text-[#181d26]">Our Use of Cookies</h2>
          <p className="text-[15px] leading-relaxed">
            Our public website operates without tracking advertising cookies. We only utilize strictly necessary functional session cookies when staff members authenticate to the internal management dashboard.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[20px] font-medium text-[#181d26]">Controlling Cookies</h2>
          <p className="text-[15px] leading-relaxed">
            You can configure your browser settings to block or notify you about cookies at any time.
          </p>
        </section>
      </div>
    </div>
  );
}
