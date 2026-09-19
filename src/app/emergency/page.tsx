import Link from "next/link";
import { Phone, AlertCircle, ShieldAlert, Calendar, MapPin, CheckCircle2 } from "lucide-react";
import {
  CLINIC_NAME,
  CLINIC_CITY,
  CLINIC_PHONE,
  CLINIC_PHONE_DIGITS,
  SAFE_DIRECTIONS_NOTICE,
} from "@/lib/constants";

export const metadata = {
  title: "Emergency Dental Care in Kampala | Dr. Dental Crest",
  description:
    "Guidance and urgent phone contact for severe dental pain, knocked-out teeth, or dental trauma in Kampala.",
};

export default function EmergencyPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="section-rhythm bg-[#aa2d00] text-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-6">
            <span className="text-[12px] font-semibold tracking-wider text-white/80 uppercase">
              Urgent Clinical Support
            </span>
            <h1 className="text-[36px] sm:text-[44px] font-normal tracking-tight leading-tight">
              Emergency Dental Care in Kampala
            </h1>
            <p className="text-[17px] text-white/90 leading-relaxed">
              If you are experiencing severe dental discomfort, tooth fractures, or dental trauma, please call our clinic immediately for prompt guidance.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <a
                href={`tel:${CLINIC_PHONE_DIGITS}`}
                className="bg-white text-[#aa2d00] hover:bg-gray-100 font-medium px-6 py-3.5 rounded-lg inline-flex items-center gap-2 shadow"
              >
                <Phone className="w-5 h-5" />
                <span className="text-[16px]">Call Clinic: {CLINIC_PHONE}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Guidance Cards */}
      <section className="section-rhythm bg-[#f8fafc] border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-xl border border-[#dddddd] space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold">
                !
              </div>
              <h3 className="text-[18px] font-medium text-[#181d26]">
                Knocked-Out Tooth
              </h3>
              <p className="text-[14px] text-[#41454d] leading-relaxed">
                Handle the tooth only by the crown (top), not the root. If clean, gently place it back in the socket or preserve it in fresh cold milk. Call our clinic immediately.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border border-[#dddddd] space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                !
              </div>
              <h3 className="text-[18px] font-medium text-[#181d26]">
                Severe Dental Pain
              </h3>
              <p className="text-[14px] text-[#41454d] leading-relaxed">
                Rinse gently with warm water. Avoid placing aspirin directly on the gums as this can cause irritation. Contact our clinic for assessment.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border border-[#dddddd] space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                !
              </div>
              <h3 className="text-[18px] font-medium text-[#181d26]">
                Chipped or Broken Tooth
              </h3>
              <p className="text-[14px] text-[#41454d] leading-relaxed">
                Save any broken tooth fragments. Rinse your mouth with warm water and apply a cold compress to the outside of the cheek to reduce swelling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Notice */}
      <section className="section-rhythm bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="p-6 bg-[#f8fafc] border border-[#dddddd] rounded-xl space-y-3">
            <h3 className="text-[18px] font-medium text-[#181d26] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>Medical Emergency Notice</span>
            </h3>
            <p className="text-[14px] text-[#41454d] leading-relaxed">
              If you or a family member are experiencing difficulty breathing, severe bleeding that will not stop, or major facial trauma following an accident, please proceed directly to the nearest hospital emergency room.
            </p>
          </div>

          <div className="text-center pt-4 space-y-4">
            <p className="text-[15px] text-[#41454d]">
              {SAFE_DIRECTIONS_NOTICE}
            </p>
            <div className="flex justify-center gap-4">
              <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="btn-primary">
                <Phone className="w-4 h-4" />
                <span>Call {CLINIC_PHONE}</span>
              </a>
              <Link href="/request-appointment" className="btn-secondary">
                <span>Request Appointment</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
