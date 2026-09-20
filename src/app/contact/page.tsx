"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  CLINIC_NAME,
  CLINIC_CITY,
  CLINIC_PHONE,
  CLINIC_PHONE_DIGITS,
  PRIMARY_CTA,
  SECONDARY_CTA,
  SAFE_DIRECTIONS_NOTICE,
} from "@/lib/constants";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          subject,
          message,
          privacyConsent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSuccessMessage(data.message);
      setName("");
      setPhone("");
      setEmail("");
      setSubject("");
      setMessage("");
      setPrivacyConsent(false);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please call the clinic directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="section-rhythm bg-white border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-6">
            <span className="text-[13px] font-semibold tracking-wider text-[#0284c7] uppercase">
              Get in Touch
            </span>
            <h1 className="text-[36px] sm:text-[44px] font-normal text-[#181d26] tracking-tight leading-tight">
              Contact {CLINIC_NAME}
            </h1>
            <p className="text-[17px] text-[#333840] leading-relaxed">
              Have a question about our dental services or need assistance? Call our clinic or send us an inquiry below.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="btn-primary">
                <Phone className="w-4 h-4" />
                <span>Call {CLINIC_PHONE}</span>
              </a>
              <Link href="/request-appointment" className="btn-secondary">
                <Calendar className="w-4 h-4 text-[#0284c7]" />
                <span>{PRIMARY_CTA}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Info & Form */}
      <section className="section-rhythm bg-[#f8fafc] border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Contact Details & Location Card */}
            <div className="lg:col-span-5 space-y-6">
              {/* Tasteful Location Card (No fake address or fabricated coordinates) */}
              <div className="bg-white rounded-xl border border-[#dddddd] p-7 space-y-5 shadow-sm">
                <h3 className="text-[18px] font-medium text-[#181d26] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#0284c7]" />
                  <span>Clinic Location</span>
                </h3>
                <div className="space-y-2 text-[14px]">
                  <p className="font-semibold text-[#181d26] text-[16px]">{CLINIC_CITY}</p>
                  <p className="text-[#41454d] leading-relaxed">{SAFE_DIRECTIONS_NOTICE}</p>
                </div>

                <div className="pt-2">
                  <a
                    href={`tel:${CLINIC_PHONE_DIGITS}`}
                    className="btn-secondary w-full justify-center text-[14px]"
                  >
                    <Phone className="w-4 h-4 text-[#0284c7]" />
                    <span>Call for Driving Directions</span>
                  </a>
                </div>
              </div>

              {/* Opening Hours Card */}
              <div className="bg-white rounded-xl border border-[#dddddd] p-7 space-y-4 shadow-sm">
                <h3 className="text-[18px] font-medium text-[#181d26] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#0284c7]" />
                  <span>Operating Hours</span>
                </h3>
                <div className="space-y-2.5 text-[14px] text-[#41454d]">
                  <div className="flex justify-between pb-2 border-b border-[#dddddd]">
                    <span>Monday – Thursday</span>
                    <span className="font-medium text-[#181d26]">8:00 AM – 8:00 PM</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-[#dddddd]">
                    <span>Friday</span>
                    <span className="font-medium text-[#181d26]">8:00 AM – 8:00 PM</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-[#dddddd]">
                    <span>Saturday</span>
                    <span className="font-medium text-[#181d26]">8:00 AM – 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium text-[#181d26]">9:00 AM – 5:00 PM</span>
                  </div>
                </div>
                <p className="text-[12px] text-gray-500 pt-2">
                  Timezone: Africa/Kampala.
                </p>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-xl border border-[#dddddd] p-8 sm:p-10 shadow-sm space-y-6">
                <div>
                  <h2 className="text-[22px] font-medium text-[#181d26]">
                    Send a Message to Our Clinic
                  </h2>
                  <p className="text-[14px] text-[#41454d] mt-1">
                    Fill in your inquiry below. For urgent appointments, please call directly.
                  </p>
                </div>

                {successMessage && (
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[14px] flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-[14px] flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[14px] font-medium text-[#181d26] mb-1">
                      Your Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Arthur Kato"
                      className="w-full h-11 px-4 border border-[#dddddd] rounded-md text-[14px] form-input-interactive focus:outline-none"
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
                        className="w-full h-11 px-4 border border-[#dddddd] rounded-md text-[14px] form-input-interactive focus:outline-none"
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
                        placeholder="arthur@example.com"
                        className="w-full h-11 px-4 border border-[#dddddd] rounded-md text-[14px] form-input-interactive focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#181d26] mb-1">
                      Subject <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Directions or Treatment Inquiry"
                      className="w-full h-11 px-4 border border-[#dddddd] rounded-md text-[14px] form-input-interactive focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#181d26] mb-1">
                      Message <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="How can our clinic help you?"
                      className="w-full p-3 border border-[#dddddd] rounded-md text-[14px] form-input-interactive focus:outline-none"
                      required
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
                        I agree to the clinic processing my message and contact details to respond to my inquiry.
                      </span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full sm:w-auto group"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending message...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
