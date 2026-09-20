import Link from "next/link";
import { CLINIC_NAME, CLINIC_CITY, CLINIC_PHONE } from "@/lib/constants";

export const metadata = {
  title: "Terms and Conditions | Dr. Dental Crest Dental Surgery",
  description: "Terms and conditions for clinic appointment requests and website use.",
};

export default function TermsPage() {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8 text-[#333840]">
        <div className="space-y-3 pb-6 border-b border-[#dddddd]">
          <span className="text-[12px] font-semibold tracking-wider text-[#08c068] uppercase">
            Legal & Compliance
          </span>
          <h1 className="text-[32px] sm:text-[38px] font-normal text-[#181d26] tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-[14px] text-[#41454d]">
            Last updated: September 2026 · {CLINIC_NAME}
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-[20px] font-medium text-[#181d26]">1. Website Purpose</h2>
          <p className="text-[15px] leading-relaxed">
            This website is provided to share verified information about {CLINIC_NAME} in Kampala and to facilitate guest appointment requests and inquiries. It does not provide medical diagnoses or replace direct clinical evaluations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[20px] font-medium text-[#181d26]">2. Appointment Requests & Confirmation</h2>
          <p className="text-[15px] leading-relaxed">
            Submitting an appointment request online creates a pending booking inquiry. Requests are not guaranteed until reviewed and confirmed by our clinic reception team via phone or email.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[20px] font-medium text-[#181d26]">3. Clinical Treatment & Consultation</h2>
          <p className="text-[15px] leading-relaxed">
            All dental treatments, suitability assessments, and clinical procedures are determined in person following a thorough examination by Dr. Silver or an authorized clinic dentist.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[20px] font-medium text-[#181d26]">4. Questions</h2>
          <p className="text-[15px] leading-relaxed">
            For questions regarding our clinic policies, please contact us at {CLINIC_PHONE}.
          </p>
        </section>
      </div>
    </div>
  );
}
