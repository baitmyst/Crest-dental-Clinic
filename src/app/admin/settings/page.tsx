import { prisma } from "@/lib/prisma";
import { Settings, ShieldCheck, Phone, MapPin, Globe } from "lucide-react";
import { CLINIC_NAME, CLINIC_CITY, CLINIC_PHONE } from "@/lib/constants";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#dddddd]">
        <h1 className="text-[24px] font-medium text-[#181d26]">
          Clinic & Site Settings
        </h1>
        <p className="text-[13px] text-[#41454d]">
          Manage clinic parameters, integrations, and timezone configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#dddddd] shadow-sm space-y-4">
          <h2 className="text-[17px] font-medium text-[#181d26]">
            Confirmed Clinic Information
          </h2>
          <div className="space-y-3 text-[13px] text-[#41454d]">
            <div className="flex justify-between pb-2 border-b border-[#dddddd]">
              <span>Clinic Name:</span>
              <strong className="text-[#181d26]">{CLINIC_NAME}</strong>
            </div>
            <div className="flex justify-between pb-2 border-b border-[#dddddd]">
              <span>City / Region:</span>
              <strong className="text-[#181d26]">{CLINIC_CITY}</strong>
            </div>
            <div className="flex justify-between pb-2 border-b border-[#dddddd]">
              <span>Primary Phone:</span>
              <strong className="text-[#181d26]">{CLINIC_PHONE}</strong>
            </div>
            <div className="flex justify-between">
              <span>System Timezone:</span>
              <strong className="text-[#181d26]">Africa/Kampala (EAT)</strong>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#dddddd] shadow-sm space-y-4">
          <h2 className="text-[17px] font-medium text-[#181d26]">
            Booking Engine Configuration
          </h2>
          <div className="space-y-3 text-[13px] text-[#41454d]">
            <div className="flex justify-between pb-2 border-b border-[#dddddd]">
              <span>Default Status for Guest Requests:</span>
              <span className="font-semibold text-amber-800">PENDING (Manual review)</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-[#dddddd]">
              <span>Minimum Booking Lead Time:</span>
              <strong className="text-[#181d26]">2 Hours</strong>
            </div>
            <div className="flex justify-between pb-2 border-b border-[#dddddd]">
              <span>Maximum Advance Booking:</span>
              <strong className="text-[#181d26]">60 Days</strong>
            </div>
            <div className="flex justify-between">
              <span>Appointment Buffer:</span>
              <strong className="text-[#181d26]">15 Minutes</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
