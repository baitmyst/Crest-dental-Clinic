import { getFaqs } from "@/lib/admin-data";
import { HelpCircle, CheckCircle2, Edit } from "lucide-react";

export default async function AdminFaqsPage() {
  const faqs = await getFaqs();


  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#dddddd]">
        <h1 className="text-[24px] font-medium text-[#181d26]">
          Frequently Asked Questions (FAQ) Manager
        </h1>
        <p className="text-[13px] text-[#41454d]">
          Manage patient questions, categorized answers, and display ordering. Non-medical guidance only.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white rounded-xl border border-[#dddddd] p-6 shadow-sm space-y-2 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-[#0a2e0e] bg-emerald-50 px-2 py-0.5 rounded uppercase">
                  {faq.category}
                </span>
                <h3 className="text-[16px] font-medium text-[#181d26] pt-1">
                  {faq.question}
                </h3>
                <p className="text-[14px] text-[#41454d] leading-relaxed">
                  {faq.answer}
                </p>
              </div>

              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[11px] font-medium shrink-0">
                Published
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
