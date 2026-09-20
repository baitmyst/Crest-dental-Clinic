import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  Users,
  UserCog,
  Stethoscope,
  Clock,
  MessageSquare,
  Globe,
  Image,
  Star,
  HelpCircle,
  Bell,
  ShieldAlert,
  BarChart3,
  Settings,
  ScrollText,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { getStaffSession } from "@/lib/auth";
import { CLINIC_NAME } from "@/lib/constants";

export const metadata = {
  title: "Staff Management Dashboard | Dr. Dental Crest",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getStaffSession();

  // If no session, redirect to staff login
  if (!session) {
    redirect("/staff/login");
  }

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Appointment Requests", href: "/admin/appointments", icon: CalendarDays },
    { name: "Calendar", href: "/admin/calendar", icon: CalendarRange },
    { name: "Clients CRM", href: "/admin/clients", icon: Users },
    { name: "Dentists", href: "/admin/dentists", icon: UserCog },
    { name: "Services", href: "/admin/services", icon: Stethoscope },
    { name: "Availability Engine", href: "/admin/availability", icon: Clock },
    { name: "Contact Inquiries", href: "/admin/inquiries", icon: MessageSquare },
    { name: "Website Content (CMS)", href: "/admin/content", icon: Globe },
    { name: "Media Library", href: "/admin/media", icon: Image },
    { name: "Testimonials", href: "/admin/testimonials", icon: Star },
    { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
    { name: "Notification Queue", href: "/admin/notifications", icon: Bell },
    { name: "Staff & Roles", href: "/admin/staff", icon: ShieldAlert, adminOnly: true },
    { name: "Clinic Reports", href: "/admin/reports", icon: BarChart3 },
    { name: "Site Settings", href: "/admin/settings", icon: Settings, adminOnly: true },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row text-[#181d26]">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-white border-r border-[#dddddd] flex flex-col shrink-0">
        {/* Clinic Header */}
        <div className="p-5 border-b border-[#dddddd] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#08c068] text-white flex items-center justify-center font-bold text-sm">
              DC
            </div>
            <div>
              <div className="font-semibold text-[15px] leading-tight text-[#181d26]">
                Dr. Dental Crest
              </div>
              <div className="text-[11px] text-[#41454d] uppercase tracking-wider">
                Management System
              </div>
            </div>
          </div>
          <Link
            href="/"
            target="_blank"
            className="text-[11px] font-medium text-[#1b61c9] hover:underline"
            title="View Public Website"
          >
            Live Site ↗
          </Link>
        </div>

        {/* Staff Identity */}
        <div className="p-4 bg-[#f8fafc] border-b border-[#dddddd] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-medium text-[13px] text-[#181d26]">
              {session.firstName} {session.lastName}
            </div>
            <div className="text-[11px] font-semibold text-[#08c068] bg-emerald-100 px-2 py-0.5 rounded inline-block">
              ROLE: {session.role}
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && session.role !== "ADMIN") return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-3 py-2 rounded-md text-[13px] text-[#333840] hover:bg-[#f8fafc] hover:text-[#181d26] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4 text-[#41454d]" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              </Link>
            );
          })}
        </nav>

        {/* Logout Action */}
        <div className="p-3 border-t border-[#dddddd]">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-red-700 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
