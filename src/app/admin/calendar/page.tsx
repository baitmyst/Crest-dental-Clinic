import { getAppointments } from "@/lib/admin-data";
import { getStaffSession } from "@/lib/auth";
import { CalendarRange, Clock, User, CheckCircle2 } from "lucide-react";

export default async function AdminCalendarPage() {
  const session = await getStaffSession();

  let whereClause: any = {};
  if (session?.role === "DENTIST") {
    whereClause.assignedDentistId = session.userId;
  }

  const appointments = await getAppointments(whereClause);


  // Group by date
  const grouped: Record<string, any[]> = {};
  for (const apt of appointments) {
    if (!grouped[apt.preferredDate]) {
      grouped[apt.preferredDate] = [];
    }
    grouped[apt.preferredDate].push(apt);
  }

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#dddddd]">
        <h1 className="text-[24px] font-medium text-[#181d26]">
          Clinic Appointment Calendar
        </h1>
        <p className="text-[13px] text-[#41454d]">
          Chronological schedule of confirmed and pending dental consultations in Kampala.
        </p>
      </div>

      {sortedDates.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-[#dddddd] text-center text-gray-500">
          No scheduled appointments found.
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date} className="bg-white rounded-xl border border-[#dddddd] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-[16px] font-semibold text-[#181d26] border-b border-[#dddddd] pb-3">
                <CalendarRange className="w-5 h-5 text-[#0a2e0e]" />
                <span>Date: {date}</span>
                <span className="text-[12px] font-normal text-[#41454d] bg-[#f8fafc] px-2 py-0.5 rounded border border-[#dddddd]">
                  {grouped[date].length} consultation{grouped[date].length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[date].map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-lg border border-[#dddddd] bg-[#f8fafc] space-y-2 hover:border-gray-400 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-mono font-semibold text-[#181d26]">
                        {apt.preferredTime} (EAT)
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          apt.status === "PENDING"
                            ? "bg-amber-100 text-amber-900"
                            : apt.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <div>
                      <div className="font-medium text-[#181d26] text-[14px]">
                        {apt.client.fullName}
                      </div>
                      <div className="text-[12px] text-[#41454d]">
                        {apt.client.phone}
                      </div>
                    </div>

                    <div className="pt-1 text-[12px] text-[#0a2e0e] font-medium border-t border-gray-200">
                      {apt.service.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
