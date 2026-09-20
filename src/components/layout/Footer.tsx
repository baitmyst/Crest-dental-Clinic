import Link from "next/link";
import { Phone, MapPin, Clock, ShieldCheck, HeartHandshake, Lock } from "lucide-react";
import { CLINIC_NAME, CLINIC_CITY, CLINIC_PHONE, CLINIC_PHONE_DIGITS, PRIMARY_SERVICES } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#dddddd] pt-16 pb-24 lg:pb-12 text-[#333840]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-[#dddddd]">
          {/* Clinic Brand & Summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#08c068] text-white flex items-center justify-center font-semibold text-lg">
                DC
              </div>
              <div>
                <div className="font-medium text-[#181d26] text-[18px]">
                  {CLINIC_NAME}
                </div>
                <div className="text-[12px] text-[#41454d] tracking-wider uppercase">
                  Dental Surgery · {CLINIC_CITY}
                </div>
              </div>
            </div>
            <p className="text-[14px] text-[#41454d] leading-relaxed max-w-sm">
              Providing professional general, cosmetic, restorative, orthodontic, and family dental care in Kampala. Led by Dr. Silver.
            </p>
            <div className="pt-2 space-y-2 text-[14px]">
              <div className="flex items-center gap-2.5 text-[#181d26]">
                <MapPin className="w-4 h-4 text-[#08c068] shrink-0" />
                <span>{CLINIC_CITY} (Please call for directions)</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#181d26]">
                <Phone className="w-4 h-4 text-[#08c068] shrink-0" />
                <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="hover:underline">
                  {CLINIC_PHONE}
                </a>
              </div>
            </div>
          </div>

          {/* Services Links */}
          <div className="space-y-3">
            <h4 className="text-[14px] font-semibold tracking-wider text-[#181d26] uppercase">
              Dental Services
            </h4>
            <ul className="space-y-2 text-[14px]">
              {PRIMARY_SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="text-[#41454d] hover:text-[#181d26] transition-colors"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links & Information */}
          <div className="space-y-3">
            <h4 className="text-[14px] font-semibold tracking-wider text-[#181d26] uppercase">
              Clinic Info
            </h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <Link href="/about" className="text-[#41454d] hover:text-[#181d26] transition-colors">
                  About Our Practice
                </Link>
              </li>
              <li>
                <Link href="/dentists" className="text-[#41454d] hover:text-[#181d26] transition-colors">
                  Meet Dr. Silver
                </Link>
              </li>
              <li>
                <Link href="/request-appointment" className="text-[#41454d] hover:text-[#181d26] transition-colors">
                  Request an Appointment
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[#41454d] hover:text-[#181d26] transition-colors">
                  Patient FAQs
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="text-[#0284c7] hover:underline font-medium">
                  Dental Emergencies
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours Summary */}
          <div className="space-y-3">
            <h4 className="text-[14px] font-semibold tracking-wider text-[#181d26] uppercase flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#08c068]" />
              <span>Opening Hours</span>
            </h4>
            <div className="text-[13px] text-[#41454d] space-y-1.5">
              <div className="flex justify-between">
                <span>Mon – Thu:</span>
                <span className="font-medium text-[#181d26]">8:00 AM – 8:00 PM</span>
              </div>
              <div className="flex justify-between text-amber-800">
                <span>Friday:</span>
                <span className="italic">Call clinic to confirm</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span className="font-medium text-[#181d26]">8:00 AM – 8:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span className="font-medium text-[#181d26]">9:00 AM – 5:00 PM</span>
              </div>
              <p className="text-[11px] text-gray-500 pt-2">
                Timezone: Africa/Kampala. Friday hours subject to administrative confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Legal & Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-[#41454d]">
          <div>
            © {new Date().getFullYear()} {CLINIC_NAME}. All rights reserved. Designed for accessible dental care in Kampala.
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/privacy" className="hover:text-[#181d26] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#181d26] transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/cancellation" className="hover:text-[#181d26] transition-colors">
              Cancellation Policy
            </Link>
            <Link href="/cookies" className="hover:text-[#181d26] transition-colors">
              Cookie Policy
            </Link>
            <Link
              href="/staff/login"
              className="text-gray-400 hover:text-gray-700 flex items-center gap-1 text-[12px] ml-2"
              title="Staff Portal Login"
            >
              <Lock className="w-3 h-3" />
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
