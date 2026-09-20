import { supabaseAdmin } from "@/services/supabase";
import { BarChart3, TrendingUp, Users, CalendarDays, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  let totalAppointments = 0;
  let confirmedCount = 0;
  let completedCount = 0;
  let pendingCount = 0;
  let cancelledCount = 0;
  let services: any[] = [];

  try {
    const [tRes, cRes, compRes, pRes, cancRes, sRes, apptsRes] = await Promise.all([
      supabaseAdmin.from("appointment_requests").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("appointment_requests").select("*", { count: "exact", head: true }).eq("status", "CONFIRMED"),
      supabaseAdmin.from("appointment_requests").select("*", { count: "exact", head: true }).eq("status", "COMPLETED"),
      supabaseAdmin.from("appointment_requests").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
      supabaseAdmin.from("appointment_requests").select("*", { count: "exact", head: true }).eq("status", "CANCELLED"),
      supabaseAdmin.from("services").select("*"),
      supabaseAdmin.from("appointment_requests").select("service_id"),
    ]);

    totalAppointments = tRes.count || 0;
    confirmedCount = cRes.count || 0;
    completedCount = compRes.count || 0;
    pendingCount = pRes.count || 0;
    cancelledCount = cancRes.count || 0;

    const serviceCounts: Record<string, number> = {};
    (apptsRes.data || []).forEach((a: any) => {
      if (a.service_id) {
        serviceCounts[a.service_id] = (serviceCounts[a.service_id] || 0) + 1;
      }
    });

    services = (sRes.data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      _count: { appointments: serviceCounts[s.id] || 0 },
    }));
  } catch (err) {
    console.error("Reports Supabase error:", err);
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#dddddd]">
        <h1 className="text-[24px] font-medium text-[#181d26]">
          Clinic Operational Reports & Statistics
        </h1>
        <p className="text-[13px] text-[#41454d]">
          Aggregated performance metrics and service distribution across all registered patient requests.
        </p>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#dddddd] shadow-sm space-y-1">
          <div className="text-[12px] font-medium text-[#41454d] uppercase tracking-wider">Total Volume</div>
          <div className="text-[28px] font-semibold text-[#181d26]">{totalAppointments}</div>
          <p className="text-[11px] text-[#41454d]">All recorded requests</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#dddddd] shadow-sm space-y-1">
          <div className="text-[12px] font-medium text-emerald-700 uppercase tracking-wider">Confirmed</div>
          <div className="text-[28px] font-semibold text-[#181d26]">{confirmedCount}</div>
          <p className="text-[11px] text-[#41454d]">Locked appointments</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#dddddd] shadow-sm space-y-1">
          <div className="text-[12px] font-medium text-blue-700 uppercase tracking-wider">Completed</div>
          <div className="text-[28px] font-semibold text-[#181d26]">{completedCount}</div>
          <p className="text-[11px] text-[#41454d]">Delivered dental care</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#dddddd] shadow-sm space-y-1">
          <div className="text-[12px] font-medium text-amber-700 uppercase tracking-wider">Pending Review</div>
          <div className="text-[28px] font-semibold text-[#181d26]">{pendingCount}</div>
          <p className="text-[11px] text-[#41454d]">Awaiting reception action</p>
        </div>
      </div>

      {/* Service Breakdown */}
      <div className="bg-white rounded-xl border border-[#dddddd] p-6 shadow-sm space-y-4">
        <h2 className="text-[16px] font-medium text-[#181d26]">
          Appointment Demand by Dental Service
        </h2>
        <div className="space-y-3">
          {services.map((s) => {
            const count = s._count?.appointments || 0;
            const pct = totalAppointments > 0 ? Math.round((count / totalAppointments) * 100) : 0;
            return (
              <div key={s.id} className="space-y-1 text-[13px]">
                <div className="flex justify-between font-medium text-[#181d26]">
                  <span>{s.name} ({s.category})</span>
                  <span>{count} requests ({pct}%)</span>
                </div>
                <div className="w-full bg-[#f8fafc] border border-[#dddddd] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#08c068] h-full rounded-full" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
