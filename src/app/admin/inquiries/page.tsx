import { prisma } from "@/lib/prisma";
import { MessageSquare, Phone, Mail, Clock, CheckCircle2 } from "lucide-react";

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#dddddd]">
        <h1 className="text-[24px] font-medium text-[#181d26]">
          Contact Inquiries
        </h1>
        <p className="text-[13px] text-[#41454d]">
          Messages received from visitors on the public contact form.
        </p>
      </div>

      <div className="space-y-4">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className="bg-white rounded-xl border border-[#dddddd] p-6 shadow-sm space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dddddd] pb-3">
              <div>
                <h3 className="text-[16px] font-medium text-[#181d26]">
                  {inq.subject}
                </h3>
                <span className="text-[12px] text-[#41454d]">
                  From: {inq.name} ({inq.email} · {inq.phone})
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-semibold uppercase self-start">
                Status: {inq.status}
              </span>
            </div>

            <p className="text-[14px] text-[#333840] leading-relaxed">
              {inq.message}
            </p>

            <div className="pt-2 flex items-center justify-between text-[12px] text-gray-400">
              <span>Received: {inq.createdAt.toLocaleDateString("en-UG")}</span>
              <a
                href={`tel:${inq.phone}`}
                className="btn-secondary text-[12px] py-1 px-3"
              >
                <Phone className="w-3.5 h-3.5 text-[#0a2e0e]" />
                <span>Call Patient</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
