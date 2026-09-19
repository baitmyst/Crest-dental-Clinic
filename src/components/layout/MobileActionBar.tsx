import Link from "next/link";
import { Phone, Calendar } from "lucide-react";
import { CLINIC_PHONE, CLINIC_PHONE_DIGITS, PRIMARY_CTA } from "@/lib/constants";

export default function MobileActionBar() {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#dddddd] p-3 z-40 shadow-lg">
      <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
        <a
          href={`tel:${CLINIC_PHONE_DIGITS}`}
          className="btn-secondary py-2.5 px-3 text-[14px] justify-center"
        >
          <Phone className="w-4 h-4 text-[#0a2e0e]" />
          <span>Call Clinic</span>
        </a>
        <Link
          href="/request-appointment"
          className="btn-primary py-2.5 px-3 text-[14px] justify-center"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Visit</span>
        </Link>
      </div>
    </div>
  );
}
