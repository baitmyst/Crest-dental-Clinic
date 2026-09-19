"use client";

import { useState, useEffect } from "react";
import { Globe, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminContentPage() {
  const [ratingEnabled, setRatingEnabled] = useState(false);
  const [ratingLabel, setRatingLabel] = useState("Rated 5.0 by our patients");
  const [locationText, setLocationText] = useState("Kampala, Uganda");
  const [seoTitle, setSeoTitle] = useState("Dr. Dental Crest Dental Surgery | Trusted Dental Care in Kampala");
  const [seoDesc, setSeoDesc] = useState("Professional general, cosmetic, restorative, orthodontic, and family dental care in Kampala.");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ratingEnabled,
          ratingLabel,
          locationText,
          defaultSeoTitle: seoTitle,
          defaultSeoDescription: seoDesc,
        }),
      });
      if (res.ok) {
        setMsg("Content and verification settings updated successfully.");
      } else {
        setMsg("Failed to update settings.");
      }
    } catch {
      setMsg("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#dddddd]">
        <h1 className="text-[24px] font-medium text-[#181d26]">
          Website Content & CMS Settings
        </h1>
        <p className="text-[13px] text-[#41454d]">
          Manage copy, SEO metadata, safe location placeholders, and patient rating visibility.
        </p>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-[13px] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Rating Block Configuration */}
        <div className="bg-white rounded-xl border border-[#dddddd] p-6 shadow-sm space-y-4">
          <h2 className="text-[17px] font-medium text-[#181d26]">
            Patient Rating Visibility Rule
          </h2>
          <p className="text-[13px] text-[#41454d]">
            A 5.0-star rating was supplied. Do not fabricate review counts or claim Google reviews. The rating block is disabled by default unless confirmed by an administrator.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="ratingToggle"
              checked={ratingEnabled}
              onChange={(e) => setRatingEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-[#181d26]"
            />
            <label htmlFor="ratingToggle" className="text-[14px] font-medium text-[#181d26] cursor-pointer">
              Enable public display of patient rating badge
            </label>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#181d26] mb-1">
              Rating Display Label (Strictly verified wording only)
            </label>
            <input
              type="text"
              value={ratingLabel}
              onChange={(e) => setRatingLabel(e.target.value)}
              className="w-full h-10 px-3 border border-[#dddddd] rounded-md text-[13px] max-w-md"
            />
            <span className="text-[11px] text-gray-500 block mt-1">
              Strict rule: Display ONLY &ldquo;Rated 5.0 by our patients&rdquo;. Never claim Google reviews without real verification.
            </span>
          </div>
        </div>

        {/* Location & Directions Notice */}
        <div className="bg-white rounded-xl border border-[#dddddd] p-6 shadow-sm space-y-4">
          <h2 className="text-[17px] font-medium text-[#181d26]">
            Location & Safe Address Text
          </h2>
          <div>
            <label className="block text-[13px] font-medium text-[#181d26] mb-1">
              Public Location Text
            </label>
            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              className="w-full h-10 px-3 border border-[#dddddd] rounded-md text-[13px] max-w-md"
            />
          </div>
          <p className="text-[12px] text-gray-500">
            Directions note on public pages displays safe phrasing: &ldquo;Visit our Kampala clinic. Please call us for directions.&rdquo;
          </p>
        </div>

        {/* SEO Metadata */}
        <div className="bg-white rounded-xl border border-[#dddddd] p-6 shadow-sm space-y-4">
          <h2 className="text-[17px] font-medium text-[#181d26]">
            Default SEO Meta Tags
          </h2>
          <div>
            <label className="block text-[13px] font-medium text-[#181d26] mb-1">
              Meta Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full h-10 px-3 border border-[#dddddd] rounded-md text-[13px]"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#181d26] mb-1">
              Meta Description
            </label>
            <textarea
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              rows={2}
              className="w-full p-2.5 border border-[#dddddd] rounded-md text-[13px]"
            ></textarea>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? "Saving Changes..." : "Save Website Content"}
          </button>
        </div>
      </form>
    </div>
  );
}
