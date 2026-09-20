"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";

export default function AdminAvailabilityPage() {
  const [fridayVerified, setFridayVerified] = useState(true);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("20:00");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const days = [
    { day: "Monday", hours: "08:00 – 20:00", status: "Verified & Bookable" },
    { day: "Tuesday", hours: "08:00 – 20:00", status: "Verified & Bookable" },
    { day: "Wednesday", hours: "08:00 – 20:00", status: "Verified & Bookable" },
    { day: "Thursday", hours: "08:00 – 20:00", status: "Verified & Bookable" },
    {
      day: "Friday",
      hours: `${startTime} – ${endTime}`,
      status: fridayVerified ? "Verified & Bookable" : "DRAFT / ADMIN CONFIRMATION REQUIRED",
      isFriday: true,
    },
    { day: "Saturday", hours: "08:00 – 20:00", status: "Verified & Bookable" },
    { day: "Sunday", hours: "09:00 – 17:00", status: "Verified & Bookable" },
  ];

  const toggleFridayVerification = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/availability/verify-friday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isVerified: !fridayVerified,
          startTime,
          endTime,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFridayVerified(!fridayVerified);
        setMsg(
          !fridayVerified
            ? "Friday schedule has been officially verified and unlocked for public online booking."
            : "Friday schedule reverted to DRAFT and locked from public booking."
        );
      } else {
        setMsg("Error: " + data.error);
      }
    } catch (err: any) {
      setMsg("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#dddddd]">
        <h1 className="text-[24px] font-medium text-[#181d26]">
          Clinic Availability & Operating Hours
        </h1>
        <p className="text-[13px] text-[#41454d]">
          Operating hours schedule (Africa/Kampala timezone). Friday is a normal working day (8:00 AM – 8:00 PM).
        </p>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-[13px] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Friday Hours Configuration Card */}
      <div className="bg-white rounded-xl border border-[#dddddd] p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-semibold text-[#181d26]">
                Friday Hours Management
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded font-semibold uppercase ${
                  fridayVerified
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {fridayVerified ? "Verified (Normal Working Day)" : "DRAFT / UNCONFIRMED"}
              </span>
            </div>
            <p className="text-[13px] text-[#41454d]">
              Friday is configured as a standard working day from 8:00 AM to 8:00 PM, fully unlocked for patient bookings.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={toggleFridayVerification}
            className={`btn-primary text-[13px] py-2 px-4 whitespace-nowrap ${
              fridayVerified ? "bg-amber-800 hover:bg-amber-900" : ""
            }`}
          >
            {saving
              ? "Saving..."
              : fridayVerified
              ? "Revert to Unconfirmed Draft"
              : "Confirm & Enable Friday Booking"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-sm pt-2">
          <div>
            <label className="block text-[12px] font-medium text-[#181d26] mb-1">
              Start Time
            </label>
            <input
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full h-9 px-3 border border-[#dddddd] rounded text-[13px]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#181d26] mb-1">
              End Time
            </label>
            <input
              type="text"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full h-9 px-3 border border-[#dddddd] rounded text-[13px]"
            />
          </div>
        </div>
      </div>

      {/* Week Schedule Overview */}
      <div className="bg-white rounded-xl border border-[#dddddd] shadow-sm overflow-hidden">
        <div className="p-4 bg-[#f8fafc] border-b border-[#dddddd] font-medium text-[14px] text-[#181d26]">
          Weekly Schedule Breakdown
        </div>
        <div className="divide-y divide-[#dddddd] text-[13px]">
          {days.map((d) => (
            <div
              key={d.day}
              className={`p-4 flex items-center justify-between ${
                d.isFriday && !fridayVerified ? "bg-amber-50/50" : ""
              }`}
            >
              <div className="space-y-0.5">
                <span className="font-medium text-[#181d26]">{d.day}</span>
                <span className="block text-[12px] text-[#41454d]">{d.hours}</span>
              </div>
              <div>
                <span
                  className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                    d.isFriday && !fridayVerified
                      ? "bg-amber-100 text-amber-900 border border-amber-200"
                      : "bg-emerald-50 text-emerald-900 border border-emerald-200"
                  }`}
                >
                  {d.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
