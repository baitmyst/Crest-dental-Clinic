import { prisma } from "@/lib/prisma";
import { Star, AlertCircle, CheckCircle2 } from "lucide-react";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#dddddd]">
        <h1 className="text-[24px] font-medium text-[#181d26]">
          Patient Testimonials Management
        </h1>
        <p className="text-[13px] text-[#41454d]">
          Manage patient testimonials. Strict rule: Do not invent fake reviews, fake ratings, or fake patient identities.
        </p>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-[13px] text-amber-900 space-y-1">
        <strong>Strict Clinic Policy:</strong> The testimonials section on the public website remains hidden until verified patient testimonials with recorded written consent are published by the clinic administrator.
      </div>

      {testimonials.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-[#dddddd] text-center text-gray-500 space-y-2">
          <p className="font-medium text-[#181d26]">No testimonials currently published.</p>
          <p className="text-[13px]">
            In adherence to strict healthcare ethics, demo testimonials are not fabricated. Published patient feedback will display here once verified.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-[#dddddd] p-6 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#181d26]">{t.displayName}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                    t.isPublished ? "bg-emerald-100 text-emerald-900" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t.isPublished ? "Published" : "Unpublished Draft"}
                </span>
              </div>
              <p className="text-[14px] text-[#41454d] italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="text-[11px] text-gray-400">
                Consent Verified: {t.consentConfirmed ? "Yes" : "Pending"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
