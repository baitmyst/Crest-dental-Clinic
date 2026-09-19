import { prisma } from "@/lib/prisma";
import { UserCog, CheckCircle2, ShieldCheck, Stethoscope } from "lucide-react";
import { LEAD_SPECIALIST } from "@/lib/constants";

export default async function AdminDentistsPage() {
  const dentists = await prisma.dentistProfile.findMany({
    include: {
      user: true,
      services: {
        include: { service: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#dddddd]">
        <h1 className="text-[24px] font-medium text-[#181d26]">
          Dentists & Clinical Specialists
        </h1>
        <p className="text-[13px] text-[#41454d]">
          Manage clinical practitioners, profile bios, bookable availability, and treatment assignments.
        </p>
      </div>

      <div className="space-y-6">
        {dentists.map((dentist) => (
          <div
            key={dentist.id}
            className="bg-white rounded-xl border border-[#dddddd] p-7 shadow-sm space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#181d26] text-white flex items-center justify-center font-medium text-xl">
                  DS
                </div>
                <div>
                  <h2 className="text-[20px] font-medium text-[#181d26]">
                    {dentist.user.firstName} {dentist.user.lastName}
                  </h2>
                  <p className="text-[13px] text-[#0a2e0e] font-medium">
                    {dentist.professionalTitle || "Lead Dental Specialist"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 text-[12px] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Bookable Online</span>
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#f8fafc] border border-[#dddddd] rounded-lg text-[13px] text-[#333840] space-y-2">
              <p>
                <strong>Biography:</strong> {dentist.biography || "Not specified."}
              </p>
              <div className="pt-2 text-[12px] text-[#41454d] space-y-1 border-t border-gray-200">
                <p>
                  <strong>Qualifications:</strong>{" "}
                  {dentist.qualifications || (
                    <span className="italic text-gray-400">
                      Unverified (Blank until verified by clinic administrator)
                    </span>
                  )}
                </p>
                <p>
                  <strong>Years Experience:</strong>{" "}
                  {dentist.yearsExperience || (
                    <span className="italic text-gray-400">Unverified</span>
                  )}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-[13px] font-semibold text-[#181d26] uppercase mb-2">
                Assigned Dental Services:
              </h4>
              <div className="flex flex-wrap gap-2">
                {dentist.services.map((ds) => (
                  <span
                    key={ds.serviceId}
                    className="px-3 py-1 bg-white border border-[#dddddd] rounded-md text-[12px] text-[#181d26]"
                  >
                    {ds.service.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
