"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Smile,
  HeartPulse,
  Users,
  HelpCircle,
} from "lucide-react";
import {
  CLINIC_NAME,
  CLINIC_CITY,
  CLINIC_PHONE,
  CLINIC_PHONE_DIGITS,
  LEAD_SPECIALIST,
  PRIMARY_SERVICES,
} from "@/lib/constants";

export default function RequestAppointmentPage() {
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [serviceSlug, setServiceSlug] = useState("general-dentistry-checkups");
  const [dentistPreference, setDentistPreference] = useState("dr-silver");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isReturningPatient, setIsReturningPatient] = useState(false);
  const [communicationMethod, setCommunicationMethod] = useState("phone");
  const [clientMessage, setClientMessage] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);

  // Availability State
  const [availableSlots, setAvailableSlots] = useState<Array<{ time: string; label: string; available: boolean }>>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsNotice, setSlotsNotice] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    referenceNumber: string;
    message: string;
    cancellationToken?: string;
  } | null>(null);

  // Default date to tomorrow if not set
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split("T")[0];
    setPreferredDate(dateString);
  }, []);

  // Fetch slots whenever date or service changes
  useEffect(() => {
    if (!preferredDate) return;

    async function fetchSlots() {
      setSlotsLoading(true);
      setSlotsNotice(null);
      try {
        const res = await fetch(`/api/availability?date=${preferredDate}&serviceSlug=${serviceSlug}`);
        const data = await res.json();
        if (data.notice) {
          setSlotsNotice(data.notice);
          setAvailableSlots([]);
        } else {
          setAvailableSlots(data.slots || []);
        }
      } catch (err) {
        console.error("Failed to load time slots", err);
      } finally {
        setSlotsLoading(false);
      }
    }

    fetchSlots();
  }, [preferredDate, serviceSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/appointment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          serviceSlug,
          preferredDate,
          preferredTime,
          isReturningPatient,
          preferredCommunicationMethod: communicationMethod,
          clientMessage: clientMessage || null,
          privacyConsent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit appointment request");
      }

      setSubmittedData({
        referenceNumber: data.referenceNumber,
        message: data.message,
        cancellationToken: data.cancellationToken,
      });
      setCurrentStep(7); // Success Screen
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again or call the clinic.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceOptions = [
    ...PRIMARY_SERVICES,
    {
      name: "I am not sure / I would like advice",
      slug: "general-advice",
      summary: "Consult with Dr. Silver to evaluate your symptoms and determine the appropriate dental care plan.",
    },
  ];

  return (
    <div className="bg-white min-h-[85vh]">
      {/* Top Banner */}
      <div className="bg-[#f8fafc] border-b border-[#dddddd] py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-[12px] font-semibold tracking-wider text-[#0a2e0e] uppercase">
            Guest Appointment System
          </span>
          <h1 className="text-[32px] sm:text-[38px] font-normal text-[#181d26] tracking-tight">
            Request an Appointment
          </h1>
          <p className="text-[15px] text-[#41454d]">
            No account required. Submit your request below and our team will contact you to confirm a convenient appointment time.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Step Progress Indicator (Steps 1 to 6) */}
        {currentStep <= 6 && (
          <div className="mb-10">
            <div className="flex items-center justify-between text-[12px] font-medium text-[#41454d] mb-3">
              <span>Step {currentStep} of 6</span>
              <span>
                {currentStep === 1 && "Choose Service"}
                {currentStep === 2 && "Dentist Preference"}
                {currentStep === 3 && "Preferred Date"}
                {currentStep === 4 && "Preferred Time"}
                {currentStep === 5 && "Contact Details"}
                {currentStep === 6 && "Review & Submit"}
              </span>
            </div>
            <div className="w-full bg-[#e0e2e6] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#181d26] h-full transition-all duration-300"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[14px] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: CHOOSE SERVICE */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-[22px] font-medium text-[#181d26]">
                Step 1: Choose a dental service
              </h2>
              <p className="text-[14px] text-[#41454d] mt-1">
                Select the treatment or consultation you are requesting.
              </p>
            </div>

            <div className="space-y-3">
              {serviceOptions.map((s) => {
                const isSelected = serviceSlug === s.slug;
                return (
                  <label
                    key={s.slug}
                    onClick={() => setServiceSlug(s.slug)}
                    className={`block p-4 sm:p-5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#181d26] bg-[#f8fafc] ring-1 ring-[#181d26]"
                        : "border-[#dddddd] bg-white hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-[#181d26] text-[16px]">
                          {s.name}
                        </div>
                        <div className="text-[13px] text-[#41454d] leading-relaxed">
                          {s.summary}
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="service"
                        checked={isSelected}
                        onChange={() => setServiceSlug(s.slug)}
                        className="mt-1 text-[#181d26] focus:ring-0"
                      />
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn-primary"
              >
                <span>Continue to Dentist</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE DENTIST PREFERENCE */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-[22px] font-medium text-[#181d26]">
                Step 2: Choose dentist preference
              </h2>
              <p className="text-[14px] text-[#41454d] mt-1">
                Select your preferred dental practitioner.
              </p>
            </div>

            <div className="space-y-3">
              <label
                onClick={() => setDentistPreference("dr-silver")}
                className={`block p-5 rounded-lg border cursor-pointer transition-all ${
                  dentistPreference === "dr-silver"
                    ? "border-[#181d26] bg-[#f8fafc] ring-1 ring-[#181d26]"
                    : "border-[#dddddd] bg-white hover:border-gray-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#181d26] text-white flex items-center justify-center font-medium text-sm">
                      DS
                    </div>
                    <div>
                      <div className="font-medium text-[#181d26] text-[16px]">
                        {LEAD_SPECIALIST}
                      </div>
                      <div className="text-[13px] text-[#41454d]">
                        Lead Dental Specialist
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="dentist"
                    checked={dentistPreference === "dr-silver"}
                    onChange={() => setDentistPreference("dr-silver")}
                  />
                </div>
              </label>

              <label
                onClick={() => setDentistPreference("no-preference")}
                className={`block p-5 rounded-lg border cursor-pointer transition-all ${
                  dentistPreference === "no-preference"
                    ? "border-[#181d26] bg-[#f8fafc] ring-1 ring-[#181d26]"
                    : "border-[#dddddd] bg-white hover:border-gray-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#181d26] text-[16px]">
                      No preference
                    </div>
                    <div className="text-[13px] text-[#41454d]">
                      First available clinic appointment slot
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="dentist"
                    checked={dentistPreference === "no-preference"}
                    onChange={() => setDentistPreference("no-preference")}
                  />
                </div>
              </label>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-primary"
              >
                <span>Continue to Date</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CHOOSE PREFERRED DATE */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-[22px] font-medium text-[#181d26]">
                Step 3: Choose preferred date
              </h2>
              <p className="text-[14px] text-[#41454d] mt-1">
                Select your preferred day for your visit to our Kampala clinic.
              </p>
            </div>

            <div className="p-6 bg-[#f8fafc] border border-[#dddddd] rounded-xl space-y-4">
              <label className="block text-[14px] font-medium text-[#181d26]">
                Appointment Date
              </label>
              <input
                type="date"
                value={preferredDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setPreferredDate(e.target.value);
                  setPreferredTime(""); // Reset slot when date changes
                }}
                className="w-full sm:w-80 h-11 px-4 border border-[#dddddd] rounded-md text-[15px] focus:outline-none focus:border-[#181d26] bg-white"
                required
              />

              <div className="pt-2 text-[12px] text-[#41454d] space-y-1">
                <p>Clinic operating hours (Africa/Kampala):</p>
                <p>• Mon–Thu, Sat: 8:00 AM – 8:00 PM</p>
                <p>• Friday: Awaiting confirmation (call clinic for Friday requests)</p>
                <p>• Sunday: 9:00 AM – 5:00 PM</p>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={!preferredDate}
                onClick={() => setCurrentStep(4)}
                className="btn-primary disabled:opacity-50"
              >
                <span>Continue to Time</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CHOOSE PREFERRED TIME SLOT */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-[22px] font-medium text-[#181d26]">
                Step 4: Choose preferred time slot
              </h2>
              <p className="text-[14px] text-[#41454d] mt-1">
                Selected Date: <span className="font-semibold text-[#181d26]">{preferredDate}</span> (Africa/Kampala Timezone)
              </p>
            </div>

            {slotsLoading ? (
              <div className="py-12 text-center text-[#41454d]">
                Calculating real-time clinic availability...
              </div>
            ) : slotsNotice ? (
              <div className="p-5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[14px] space-y-2">
                <div className="font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Administrative Schedule Notice</span>
                </div>
                <p>{slotsNotice}</p>
                <div className="pt-2">
                  <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="btn-secondary text-[13px] py-1.5 px-3">
                    <Phone className="w-3.5 h-3.5 text-[#0a2e0e]" />
                    <span>Call {CLINIC_PHONE}</span>
                  </a>
                </div>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="py-8 text-center text-[#41454d] space-y-2">
                <p>No online slots available for this date.</p>
                <p className="text-[13px]">Please choose another date or call our clinic directly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availableSlots.map((slot) => {
                  const isSelected = preferredTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setPreferredTime(slot.time)}
                      className={`p-3 text-[14px] rounded-lg border font-medium transition-all ${
                        !slot.available
                          ? "opacity-40 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400"
                          : isSelected
                          ? "bg-[#181d26] text-white border-[#181d26]"
                          : "bg-white text-[#181d26] border-[#dddddd] hover:border-gray-400"
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={!preferredTime}
                onClick={() => setCurrentStep(5)}
                className="btn-primary disabled:opacity-50"
              >
                <span>Continue to Contact</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: ENTER CONTACT DETAILS */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-[22px] font-medium text-[#181d26]">
                Step 5: Enter personal contact details
              </h2>
              <p className="text-[14px] text-[#41454d] mt-1">
                We will use this information to reach you and confirm your appointment.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#181d26] mb-1">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Grace Nabakooza"
                  className="w-full h-11 px-4 border border-[#dddddd] rounded-md text-[14px] focus:outline-none focus:border-[#181d26]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#181d26] mb-1">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+256 700 000000"
                    className="w-full h-11 px-4 border border-[#dddddd] rounded-md text-[14px] focus:outline-none focus:border-[#181d26]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#181d26] mb-1">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="grace@example.com"
                    className="w-full h-11 px-4 border border-[#dddddd] rounded-md text-[14px] focus:outline-none focus:border-[#181d26]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#181d26] mb-1">
                  Have you visited our clinic before?
                </label>
                <div className="flex items-center gap-6 pt-1 text-[14px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="returning"
                      checked={!isReturningPatient}
                      onChange={() => setIsReturningPatient(false)}
                    />
                    <span>New Patient</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="returning"
                      checked={isReturningPatient}
                      onChange={() => setIsReturningPatient(true)}
                    />
                    <span>Returning Patient</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#181d26] mb-1">
                  Preferred Communication Method
                </label>
                <div className="flex items-center gap-6 pt-1 text-[14px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="comms"
                      checked={communicationMethod === "phone"}
                      onChange={() => setCommunicationMethod("phone")}
                    />
                    <span>Phone Call</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="comms"
                      checked={communicationMethod === "email"}
                      onChange={() => setCommunicationMethod("email")}
                    />
                    <span>Email</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#181d26] mb-1">
                  Symptoms, Reason for Visit, or Message (Optional)
                </label>
                <textarea
                  value={clientMessage}
                  onChange={(e) => setClientMessage(e.target.value)}
                  rows={3}
                  placeholder="Tell us if you have any dental discomfort, specific tooth concerns, or consultation goals..."
                  className="w-full p-3 border border-[#dddddd] rounded-md text-[14px] focus:outline-none focus:border-[#181d26]"
                ></textarea>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyConsent}
                    onChange={(e) => setPrivacyConsent(e.target.checked)}
                    className="mt-1"
                    required
                  />
                  <span className="text-[13px] text-[#41454d] leading-relaxed">
                    I agree to the clinic storing my contact details for the purpose of scheduling and confirming this appointment request, as outlined in the{" "}
                    <Link href="/privacy" target="_blank" className="text-[#1b61c9] underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="btn-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={!fullName || !phone || !email || !privacyConsent}
                onClick={() => setCurrentStep(6)}
                className="btn-primary disabled:opacity-50"
              >
                <span>Review Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW AND SUBMIT */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-[22px] font-medium text-[#181d26]">
                Step 6: Review and submit appointment request
              </h2>
              <p className="text-[14px] text-[#41454d] mt-1">
                Please verify your details. Your appointment request will be saved as PENDING and reviewed by clinic staff.
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-[#dddddd] rounded-xl p-6 space-y-4 text-[14px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#dddddd]">
                <div>
                  <span className="text-[#41454d] block text-[12px] uppercase">Service</span>
                  <span className="font-medium text-[#181d26]">
                    {serviceOptions.find((s) => s.slug === serviceSlug)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-[#41454d] block text-[12px] uppercase">Dentist</span>
                  <span className="font-medium text-[#181d26]">
                    {dentistPreference === "dr-silver" ? LEAD_SPECIALIST : "No preference"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#dddddd]">
                <div>
                  <span className="text-[#41454d] block text-[12px] uppercase">Preferred Date</span>
                  <span className="font-medium text-[#181d26]">{preferredDate}</span>
                </div>
                <div>
                  <span className="text-[#41454d] block text-[12px] uppercase">Preferred Time Slot</span>
                  <span className="font-medium text-[#181d26]">{preferredTime} (Africa/Kampala)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#dddddd]">
                <div>
                  <span className="text-[#41454d] block text-[12px] uppercase">Patient Name</span>
                  <span className="font-medium text-[#181d26]">{fullName}</span>
                </div>
                <div>
                  <span className="text-[#41454d] block text-[12px] uppercase">Contact Details</span>
                  <span className="font-medium text-[#181d26]">{phone} · {email}</span>
                </div>
              </div>

              {clientMessage && (
                <div>
                  <span className="text-[#41454d] block text-[12px] uppercase">Message / Reason</span>
                  <span className="text-[#333840]">{clientMessage}</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[13px]">
              <strong>Note:</strong> No account will be created. We will call you or email you to confirm your exact appointment slot.
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="btn-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Edit Details</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="btn-primary"
              >
                {isSubmitting ? (
                  <span>Submitting Request...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Confirm & Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: SUCCESS CONFIRMATION SCREEN */}
        {currentStep === 7 && submittedData && (
          <div className="bg-white border border-[#dddddd] rounded-xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[12px] font-semibold rounded-full uppercase tracking-wider">
                Status: PENDING REVIEW
              </span>
              <h2 className="text-[28px] font-normal text-[#181d26]">
                Appointment Request Received
              </h2>
              <p className="text-[16px] text-[#333840] max-w-lg mx-auto leading-relaxed">
                {submittedData.message}
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-[#dddddd] rounded-lg p-5 max-w-md mx-auto space-y-2">
              <span className="text-[12px] uppercase text-[#41454d] tracking-wider block">
                Appointment Reference Number
              </span>
              <span className="text-[24px] font-semibold text-[#181d26] tracking-wider font-mono">
                {submittedData.referenceNumber}
              </span>
              <p className="text-[12px] text-[#41454d]">
                Please save this reference number for your records.
              </p>
            </div>

            <div className="text-[14px] text-[#41454d] max-w-md mx-auto space-y-2">
              <p>
                Our reception team will review your requested date (<strong className="text-[#181d26]">{preferredDate}</strong> at <strong className="text-[#181d26]">{preferredTime}</strong>) and contact you shortly.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/" className="btn-primary">
                <span>Return to Homepage</span>
              </Link>
              <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="btn-secondary">
                <Phone className="w-4 h-4 text-[#0a2e0e]" />
                <span>Call {CLINIC_PHONE}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
