import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Stethoscope, Clock, ShieldCheck, ArrowRight } from "lucide-react";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#dddddd]">
        <h1 className="text-[24px] font-medium text-[#181d26]">
          Dental Services Management
        </h1>
        <p className="text-[13px] text-[#41454d]">
          Manage clinical treatment categories, consultation durations, and treatment descriptions. Strictly no public pricing fields exist.
        </p>
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl border border-[#dddddd] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#0a2e0e] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                  {service.category}
                </span>
                <span className="text-[12px] text-gray-500 font-mono">
                  /{service.slug}
                </span>
              </div>
              <h3 className="text-[18px] font-medium text-[#181d26]">
                {service.name}
              </h3>
              <p className="text-[13px] text-[#41454d] line-clamp-2">
                {service.shortDescription}
              </p>
            </div>

            <div className="flex items-center gap-6 text-[13px] shrink-0">
              <div className="text-right">
                <span className="text-gray-400 block text-[11px] uppercase">Duration:</span>
                <span className="font-semibold text-[#181d26]">{service.durationMinutes} mins</span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block text-[11px] uppercase">Buffer:</span>
                <span className="font-semibold text-[#181d26]">{service.bufferMinutes} mins</span>
              </div>
              <Link
                href={`/services/${service.slug}`}
                target="_blank"
                className="btn-secondary text-[12px] py-1.5 px-3"
              >
                <span>View Public Page ↗</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
