import Link from "next/link";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  MessageSquare,
  ArrowRight,
  Plus,
  ShieldCheck,
  Stethoscope,
  XCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";
import { AppointmentStatus, InquiryStatus } from "@prisma/client";

export default async function AdminDashboardPage() {
  const session = await getStaffSession();

  // Load counts
  const [
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    noShowAppointments,
    openInquiries,
    totalClients,
    recentAppointments,
    recentInquiries,
  ] = await Promise.all([
    prisma.appointmentRequest.count(),
    prisma.appointmentRequest.count({ where: { status: AppointmentStatus.PENDING } }),
    prisma.appointmentRequest.count({ where: { status: AppointmentStatus.CONFIRMED } }),
    prisma.appointmentRequest.count({ where: { status: AppointmentStatus.COMPLETED } }),
    prisma.appointmentRequest.count({ where: { status: AppointmentStatus.CANCELLED } }),
    prisma.appointmentRequest.count({ where: { status: AppointmentStatus.NO_SHOW } }),
    prisma.contactInquiry.count({ where: { status: InquiryStatus.OPEN } }),
    prisma.client.count(),
    prisma.appointmentRequest.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { client: true, service: true },
    }),
    prisma.contactInquiry.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#dddddd]">
        <div>
          <h1 className="text-[26px] font-normal text-[#181d26] tracking-tight">
            Clinic Overview
          </h1>
          <p className="text-[13px] text-[#41454d]">
            Welcome back, {session?.firstName}. Operational monitoring for Dr. Dental Crest Dental Surgery (Kampala).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/appointments"
            className="btn-primary text-[13px] py-2 px-3.5"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Review Pending Requests ({pendingAppointments})</span>
          </Link>
        </div>
      </div>

      {/* Friday Operating Hours Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start justify-between gap-4 text-[13px] text-amber-900">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Administrative Schedule Notice:</strong> Friday hours (8:00 AM – 8:30 AM) are flagged as <em>DRAFT / NEEDS CONFIRMATION</em>. Public live booking for Friday is locked until approved in Availability Settings.
          </div>
        </div>
        <Link
          href="/admin/availability"
          className="text-[12px] font-semibold text-amber-900 underline whitespace-nowrap"
        >
          Review Hours &rarr;
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Pending Requests */}
        <div className="bg-white p-5 rounded-xl border border-[#dddddd] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[12px] font-medium text-amber-700 uppercase tracking-wider">
            <span>Pending Requests</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-[28px] font-semibold text-[#181d26]">
            {pendingAppointments}
          </div>
          <p className="text-[11px] text-[#41454d]">Requires manual staff review</p>
        </div>

        {/* Confirmed Appointments */}
        <div className="bg-white p-5 rounded-xl border border-[#dddddd] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[12px] font-medium text-emerald-700 uppercase tracking-wider">
            <span>Confirmed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-[28px] font-semibold text-[#181d26]">
            {confirmedAppointments}
          </div>
          <p className="text-[11px] text-[#41454d]">Ready for patient visit</p>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-xl border border-[#dddddd] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[12px] font-medium text-blue-700 uppercase tracking-wider">
            <span>Completed</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-[28px] font-semibold text-[#181d26]">
            {completedAppointments}
          </div>
          <p className="text-[11px] text-[#41454d]">Consultations delivered</p>
        </div>

        {/* Total Inquiries */}
        <div className="bg-white p-5 rounded-xl border border-[#dddddd] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[12px] font-medium text-purple-700 uppercase tracking-wider">
            <span>Open Inquiries</span>
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="text-[28px] font-semibold text-[#181d26]">
            {openInquiries}
          </div>
          <p className="text-[11px] text-[#41454d]">Website contact questions</p>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-[#dddddd] text-[13px]">
        <div>
          <span className="text-[#41454d] block">Total Requests:</span>
          <strong className="text-[16px] text-[#181d26]">{totalAppointments}</strong>
        </div>
        <div>
          <span className="text-[#41454d] block">Total Registered Clients:</span>
          <strong className="text-[16px] text-[#181d26]">{totalClients}</strong>
        </div>
        <div>
          <span className="text-[#41454d] block">Cancelled Requests:</span>
          <strong className="text-[16px] text-red-700">{cancelledAppointments}</strong>
        </div>
        <div>
          <span className="text-[#41454d] block">No-Show Records:</span>
          <strong className="text-[16px] text-amber-900">{noShowAppointments}</strong>
        </div>
      </div>

      {/* Recent Appointments & Contact Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#dddddd] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-medium text-[#181d26]">
              Recent Appointment Inquiries
            </h2>
            <Link
              href="/admin/appointments"
              className="text-[13px] font-medium text-[#1b61c9] hover:underline"
            >
              View all ({totalAppointments}) &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#f8fafc] text-[#41454d] border-b border-[#dddddd]">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Ref #</th>
                  <th className="py-2.5 px-3 font-medium">Patient</th>
                  <th className="py-2.5 px-3 font-medium">Service</th>
                  <th className="py-2.5 px-3 font-medium">Date / Slot</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dddddd]">
                {recentAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3 font-mono font-medium text-[#181d26]">
                      {apt.referenceNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#181d26]">{apt.client.fullName}</div>
                      <div className="text-[11px] text-[#41454d]">{apt.client.phone}</div>
                    </td>
                    <td className="py-3 px-3 text-[#333840]">{apt.service.name}</td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#181d26]">{apt.preferredDate}</div>
                      <div className="text-[11px] text-[#41454d]">{apt.preferredTime}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                          apt.status === "PENDING"
                            ? "bg-amber-100 text-amber-900"
                            : apt.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-900"
                            : apt.status === "CANCELLED"
                            ? "bg-red-100 text-red-900"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Link
                        href={`/admin/appointments?search=${apt.referenceNumber}`}
                        className="text-[12px] font-medium text-[#1b61c9] hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#dddddd] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-medium text-[#181d26]">
              Contact Messages
            </h2>
            <Link
              href="/admin/inquiries"
              className="text-[13px] font-medium text-[#1b61c9] hover:underline"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {recentInquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-3.5 rounded-lg border border-[#dddddd] bg-[#f8fafc] space-y-1.5"
              >
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-medium text-[#181d26]">{inq.name}</span>
                  <span className="text-[11px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                    {inq.status}
                  </span>
                </div>
                <div className="text-[13px] font-medium text-[#333840]">{inq.subject}</div>
                <p className="text-[12px] text-[#41454d] line-clamp-2">{inq.message}</p>
                <div className="text-[11px] text-gray-400 pt-1">{inq.phone} · {inq.email}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
