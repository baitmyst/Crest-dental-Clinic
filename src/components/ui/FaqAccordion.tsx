"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
  defaultOpenIndex?: number;
}

export default function FaqAccordion({ faqs, defaultOpenIndex = 0 }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(
    faqs.length > 0 && defaultOpenIndex >= 0 ? faqs[defaultOpenIndex]?.id || null : null
  );

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  if (!faqs || faqs.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        FAQs available upon clinic publication.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className={`bg-white rounded-xl border transition-all duration-200 shadow-sm ${
              isOpen
                ? "border-[#0a2e0e]/40 ring-1 ring-[#0a2e0e]/10 shadow-md"
                : "border-[#dddddd] hover:border-[#cbd5e1]"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a2e0e] rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-[#0a2e0e] shrink-0" />
                <span className="text-[16px] font-medium text-[#181d26]">
                  {faq.question}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#41454d] shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-[#0a2e0e]" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-0 text-[14px] text-[#41454d] leading-relaxed pl-12 animate-entrance">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
