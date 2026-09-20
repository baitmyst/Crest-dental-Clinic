"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Calendar, CheckCircle2, AlertCircle, Search } from "lucide-react";
import { CLINIC_NAME, CLINIC_PHONE, CLINIC_PHONE_DIGITS, PRIMARY_CTA } from "@/lib/constants";

export default function CancellationPolicyPage() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCancellationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/appointment-requests/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceNumber: referenceNumber.trim(), reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to process cancellation request");
      }
      setStatusMessage(data.message);
      setReferenceNumber("");
      setReason("");
    } catch (err: any) {
      setErrorMessage(err.message || "Please call our clinic directly at " + CLINIC_PHONE);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-10 text-[#333840]">
        <div className="space-y-3 pb-6 border-b border-[#dddddd]">
          <span className="text-[12px] font-semibold tracking-wider text-[#08c068] uppercase">
            Clinic Policies
          </span>
          <h1 className="text-[32px] sm:text-[38px] font-normal text-[#181d26] tracking-tight">
            Appointment Cancellation & Rescheduling
          </h1>
          <p className="text-[14px] text-[#41454d]">
            {CLINIC_NAME} · Kampala, Uganda
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-[20px] font-medium text-[#181d26]">
            Advance Notice Request
          </h2>
          <p className="text-[15px] leading-relaxed">
            We understand that plans can change. If you are unable to attend your scheduled appointment, we kindly ask for at least 24 hours of advance notice so our team can accommodate other patients needing dental care in Kampala.
          </p>
        </section>

        {/* Guest Cancellation Tool (No login required) */}
        <section className="bg-[#f8fafc] border border-[#dddddd] rounded-xl p-7 space-y-5">
          <div>
            <h3 className="text-[18px] font-medium text-[#181d26]">
              Request an Appointment Cancellation Online
            </h3>
            <p className="text-[13px] text-[#41454d] mt-1">
              No login required. Enter your appointment reference number (e.g. DDC-2026-000001) to request cancellation.
            </p>
          </div>

          {statusMessage && (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[14px] flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-[14px] flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleCancellationRequest} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#181d26] mb-1">
                Reference Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="DDC-2026-XXXXXX"
                className="w-full h-11 px-4 border border-[#dddddd] rounded-md text-[14px] focus:outline-none focus:border-[#181d26] uppercase font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#181d26] mb-1">
                Reason for Cancellation or Rescheduling (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Briefly describe if you wish to reschedule or cancel..."
                className="w-full p-3 border border-[#dddddd] rounded-md text-[14px] focus:outline-none focus:border-[#181d26]"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-[14px] py-2.5"
            >
              {isSubmitting ? "Processing..." : "Submit Cancellation Request"}
            </button>
          </form>
        </section>

        <section className="space-y-3 pt-2">
          <h2 className="text-[20px] font-medium text-[#181d26]">
            Need Immediate Assistance?
          </h2>
          <p className="text-[15px] leading-relaxed">
            You can also call our reception desk directly to reschedule your consultation time at any moment:
          </p>
          <div className="pt-2">
            <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="btn-secondary">
              <Phone className="w-4 h-4 text-[#08c068]" />
              <span>Call {CLINIC_PHONE}</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
