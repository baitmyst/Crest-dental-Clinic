import { getMedia } from "@/lib/admin-data";
import { Image as ImageIcon, Upload, FileText, CheckCircle2 } from "lucide-react";

export default async function AdminMediaPage() {
  const media = await getMedia();


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#dddddd]">
        <div>
          <h1 className="text-[24px] font-medium text-[#181d26]">
            Media Asset Library
          </h1>
          <p className="text-[13px] text-[#41454d]">
            Manage clinic visual assets, logos, and dental stock photography with descriptive alt text. Avoid scraping unverified Google images.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#dddddd] shadow-sm space-y-4">
        <h3 className="text-[16px] font-medium text-[#181d26]">
          Asset Standards & Hygiene Guidelines
        </h3>
        <ul className="text-[13px] text-[#41454d] space-y-2 list-disc list-inside">
          <li>Never scrape or hotlink images directly from Google Search results.</li>
          <li>Ensure all patient clinic photos have recorded written consent.</li>
          <li>Avoid graphic surgical images or alarming tooth photography.</li>
          <li>Always provide clear alt text for accessibility and local healthcare SEO.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-dashed border-[#dddddd] p-8 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#f8fafc] border border-[#dddddd] flex items-center justify-center text-[#0a2e0e]">
            <Upload className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[14px] font-medium text-[#181d26]">Upload Clinic Asset</span>
            <p className="text-[12px] text-[#41454d]">JPEG, PNG, WebP up to 5MB</p>
          </div>
        </div>

        {media.map((asset) => (
          <div
            key={asset.id}
            className="bg-white rounded-xl border border-[#dddddd] p-4 shadow-sm space-y-2"
          >
            <div className="h-36 bg-[#f8fafc] rounded-lg border border-gray-200 flex items-center justify-center text-gray-400">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div className="text-[13px] font-medium text-[#181d26] truncate">
              {asset.fileName}
            </div>
            <p className="text-[11px] text-gray-400">Alt: {asset.altText}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
