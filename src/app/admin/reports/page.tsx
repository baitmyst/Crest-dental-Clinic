import { prisma } from "@/lib/prisma";
import { BarChart3, TrendingUp, Users, CalendarDays, CheckCircle2 } from "lucide-react";

export default async function AdminReportsPage() {
  const [totalAppointments, confirmedCount, completedCount, pendingCount, cancelledCount] =
    await Promise.all([
      prisma.appointmentRequest.count(),
      prisma.appointmentRequest.count({ where: { status: "CONFIRMED" } }),
      prisma.appointmentRequest.count({ where: { status: "COMPLETED" } }),
      prisma.appointmentRequest.count({ where: { status: "PENDING" } }),
      prisma.appointmentRequest.count({ where: { status: "CANCELLED" } }),
    ]);

  const services = await prisma.service.findMany({
    include: {
      _count: {
        select: { appointments: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#dddddd]">
        <h1 className="text-[24px] font-medium text-[#181d26]">
          Clinic Operational Reports & Statistics
        </h1>
        <p className="text-[13px] text-[#41454d]">
          Aggregated summaries of appointment requests, service demand, and conversion rates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#dddddd] shadow-sm space-y-2">
          <span className="text-[12px] font-semibold text-[#0a2e0e] uppercase">
            Total Request Volume
          </span>
          <div className="text-[32px] font-semibold text-[#181d26]">
            {totalAppointments}
          </div>
          <p className="text-[12px] text-[#41454d]">
            Total patient inquiries received through web and phone.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#dddddd] shadow-sm space-y-2">
          <span className="text-[12px] font-semibold text-emerald-700 uppercase">
            Confirmed & Completed
          </span>
          <div className="text-[32px] font-semibold text-[#181d26]">
            {confirmedCount + completedCount}
          </div>
          <p className="text-[12px] text-[#41454d]">
            Appointments verified and delivered by clinic staff.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#dddddd] shadow-sm space-y-2">
          <span className="text-[12px] font-semibold text-amber-700 uppercase">
            Pending Review
          </span>
          <div className="text-[32px] font-semibold text-[#181d26]">
            {pendingCount}
          </div>
          <p className="text-[12px] text-[#41454d]">
            Awaiting receptionist phone outreach.
          </p>
        </div>
      </div>

      {/* Service Demand Breakdown */}
      <div className="bg-white rounded-xl border border-[#dddddd] p-6 shadow-sm space-y-4">
        <h2 className="text-[18px] font-medium text-[#181d26]">
          Service Category Demand
        </h2>
        <div className="space-y-3">
          {services.map((svc) => (
            <div key={svc.id} className="space-y-1">
              <div className="flex justify-between text-[13px]">
                <span className="font-medium text-[#181d26]">{svc.name}</span>
                <span className="text-[#41454d] font-semibold">{svc._count.appointments} requests</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0a2e0e] h-full"
                  style={{
                    width: `${
                      totalAppointments > 0
                        ? (svc._count.appointments / totalAppointments) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
