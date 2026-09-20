"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Calendar, CheckCircle2, AlertCircle, Search, Clock, Stethoscope, User } from "lucide-react";
import { CLINIC_NAME, CLINIC_PHONE, CLINIC_PHONE_DIGITS } from "@/lib/constants";

export default function CancellationPolicyPage() {
  const [activeTab, setActiveTab] = useState<"lookup" | "cancel">("lookup");

  // Status Lookup State
  const [lookupRef, setLookupRef] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [appointmentData, setAppointmentData] = useState<{
    id: string;
    referenceNumber: string;
    preferredDate: string;
    preferredTime: string;
    status: string;
    serviceName: string;
    clientName: string;
  } | null>(null);

  // Cancellation State
  const [referenceNumber, setReferenceNumber] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupRef.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);
    setAppointmentData(null);

    try {
      const res = await fetch(`/api/appointment-requests/lookup?ref=${encodeURIComponent(lookupRef.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Appointment not found");
      }
      setAppointmentData(data.appointment);
    } catch (err: any) {
      setLookupError(err.message || "Failed to find appointment record");
    } finally {
      setIsLookingUp(false);
    }
  };

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

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-semibold text-[12px]">Pending Clinic Confirmation</span>;
      case "CONFIRMED":
        return <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-semibold text-[12px]">Confirmed by Clinic</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-900 font-semibold text-[12px]">Completed Visit</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-1 rounded bg-red-100 text-red-900 font-semibold text-[12px]">Cancelled</span>;
      case "NO_SHOW":
        return <span className="px-2.5 py-1 rounded bg-gray-200 text-gray-800 font-semibold text-[12px]">No Show</span>;
      default:
        return <span className="px-2.5 py-1 rounded bg-gray-100 text-gray-700 text-[12px]">{status}</span>;
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-10 text-[#333840]">
        <div className="space-y-3 pb-6 border-b border-[#dddddd]">
          <span className="text-[12px] font-semibold tracking-wider text-[#08c068] uppercase">
            Patient Portal & Policies
          </span>
          <h1 className="text-[32px] sm:text-[38px] font-normal text-[#181d26] tracking-tight">
            Appointment Status & Cancellation
          </h1>
          <p className="text-[14px] text-[#41454d]">
            {CLINIC_NAME} · Kampala, Uganda
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#dddddd] gap-6 text-[14px] font-medium">
          <button
            onClick={() => setActiveTab("lookup")}
            className={`pb-3 transition-colors ${
              activeTab === "lookup"
                ? "border-b-2 border-[#08c068] text-[#181d26] font-semibold"
                : "text-[#41454d] hover:text-[#181d26]"
            }`}
          >
            Check Appointment Status
          </button>
          <button
            onClick={() => setActiveTab("cancel")}
            className={`pb-3 transition-colors ${
              activeTab === "cancel"
                ? "border-b-2 border-[#08c068] text-[#181d26] font-semibold"
                : "text-[#41454d] hover:text-[#181d26]"
            }`}
          >
            Request Cancellation / Reschedule
          </button>
        </div>

        {/* TAB 1: STATUS LOOKUP */}
        {activeTab === "lookup" && (
          <section className="bg-[#f8fafc] border border-[#dddddd] rounded-xl p-7 space-y-5">
            <div>
              <h2 className="text-[18px] font-medium text-[#181d26]">
                Look Up Live Appointment Status
              </h2>
              <p className="text-[13px] text-[#41454d] mt-1">
                Enter your unique reference number (e.g. DDC-2026-000001) to verify your request status in real time.
              </p>
            </div>

            {lookupError && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-[14px] flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={lookupRef}
                onChange={(e) => setLookupRef(e.target.value)}
                placeholder="DDC-2026-XXXXXX"
                className="flex-1 h-11 px-4 border border-[#dddddd] rounded-md text-[14px] focus:outline-none focus:border-[#181d26] uppercase font-mono"
                required
              />
              <button
                type="submit"
                disabled={isLookingUp}
                className="btn-primary text-[14px] py-2.5 px-6 shrink-0"
              >
                {isLookingUp ? "Checking..." : "Look Up Status"}
              </button>
            </form>

            {appointmentData && (
              <div className="mt-6 p-5 bg-white border border-[#dddddd] rounded-xl shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#dddddd]">
                  <div>
                    <span className="text-[11px] font-mono text-[#41454d] uppercase">Reference</span>
                    <div className="text-[17px] font-semibold text-[#181d26] font-mono">
                      {appointmentData.referenceNumber}
                    </div>
                  </div>
                  <div>{renderStatusBadge(appointmentData.status)}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                  <div className="flex items-center gap-2.5 text-[#333840]">
                    <User className="w-4 h-4 text-[#08c068]" />
                    <span>Patient: <strong>{appointmentData.clientName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#333840]">
                    <Stethoscope className="w-4 h-4 text-[#08c068]" />
                    <span>Service: <strong>{appointmentData.serviceName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#333840]">
                    <Calendar className="w-4 h-4 text-[#08c068]" />
                    <span>Date: <strong>{appointmentData.preferredDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#333840]">
                    <Clock className="w-4 h-4 text-[#08c068]" />
                    <span>Time: <strong>{appointmentData.preferredTime}</strong></span>
                  </div>
                </div>

                {appointmentData.status === "PENDING" && (
                  <p className="text-[12px] text-amber-800 bg-amber-50 p-3 rounded-md border border-amber-200">
                    Your request is in the clinic queue. Our receptionist will call your phone shortly to confirm your consultation.
                  </p>
                )}

                {appointmentData.status === "CONFIRMED" && (
                  <p className="text-[12px] text-emerald-800 bg-emerald-50 p-3 rounded-md border border-emerald-200">
                    Your appointment has been confirmed! Please arrive 10 minutes prior to your scheduled time at our Kampala clinic.
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: CANCELLATION REQUEST */}
        {activeTab === "cancel" && (
          <section className="bg-[#f8fafc] border border-[#dddddd] rounded-xl p-7 space-y-5">
            <div>
              <h2 className="text-[18px] font-medium text-[#181d26]">
                Request an Appointment Cancellation Online
              </h2>
              <p className="text-[13px] text-[#41454d] mt-1">
                No login required. Enter your appointment reference number (e.g. DDC-2026-000001) to cancel your visit.
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
                className="btn-primary text-[14px] py-2.5 px-6"
              >
                {isSubmitting ? "Processing..." : "Submit Cancellation Request"}
              </button>
            </form>
          </section>
        )}

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
