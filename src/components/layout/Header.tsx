"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, Menu, X, Calendar, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { CLINIC_NAME, CLINIC_PHONE, CLINIC_PHONE_DIGITS, PRIMARY_CTA } from "@/lib/constants";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#dddddd]/80"
          : "bg-white border-b border-[#dddddd]"
      }`}
    >
      {/* Top Announcement Bar */}
      <div className="bg-[#08c068] text-white text-[13px] py-2 px-4 transition-colors shadow-sm">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span className="font-medium">Professional Dental Care in Kampala</span>
            <span className="hidden md:inline text-white/60">|</span>
            <span className="hidden md:inline text-white/95">
              Mon–Thu, Sat: 8:00 AM–8:00 PM · Sun: 9:00 AM–5:00 PM
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${CLINIC_PHONE_DIGITS}`}
              className="flex items-center gap-1.5 text-white/90 hover:text-white font-medium transition-colors duration-200"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{CLINIC_PHONE}</span>
            </a>
            <a
              href={`tel:${CLINIC_PHONE_DIGITS}`}
              className="hidden sm:inline-block bg-white/20 hover:bg-white/30 text-white font-medium text-[12px] px-2.5 py-1 rounded transition-colors duration-200"
            >
              Call Our Clinic
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="max-w-[1280px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-[#0a2e0e] text-white flex items-center justify-center font-semibold text-lg tracking-tight transition-transform duration-200 group-hover:scale-105">
            DC
          </div>
          <div>
            <div className="font-medium text-[#181d26] text-[17px] leading-tight tracking-tight group-hover:text-[#0a2e0e] transition-colors duration-200">
              Dr. Dental Crest
            </div>
            <div className="text-[12px] text-[#41454d] font-normal tracking-wide uppercase">
              Dental Surgery · Kampala
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-7 text-[14px] text-[#333840] font-normal">
          <Link href="/" className="relative py-1 hover:text-[#0a2e0e] transition-colors duration-200">
            Home
          </Link>
          <Link href="/about" className="relative py-1 hover:text-[#0a2e0e] transition-colors duration-200">
            About Us
          </Link>
          <Link href="/services" className="relative py-1 hover:text-[#0a2e0e] transition-colors duration-200">
            Services
          </Link>
          <Link href="/dentists" className="relative py-1 hover:text-[#0a2e0e] transition-colors duration-200">
            Our Dentist
          </Link>
          <Link href="/faq" className="relative py-1 hover:text-[#0a2e0e] transition-colors duration-200">
            FAQs
          </Link>
          <Link href="/contact" className="relative py-1 hover:text-[#0a2e0e] transition-colors duration-200">
            Contact
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href={`tel:${CLINIC_PHONE_DIGITS}`}
            className="text-[14px] text-[#181d26] font-medium flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-[#0a2e0e] transition-all duration-200"
          >
            <Phone className="w-4 h-4 text-[#0a2e0e]" />
            <span>{CLINIC_PHONE}</span>
          </a>
          <Link href="/request-appointment" className="btn-primary py-2.5 px-5 text-[15px] group">
            <Calendar className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            <span>{PRIMARY_CTA}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-[#181d26] hover:bg-gray-100 focus:outline-none transition-colors duration-200"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[112px] bottom-0 bg-white z-50 flex flex-col justify-between p-6 overflow-y-auto border-t border-[#dddddd] animate-entrance">
          <div className="space-y-4">
            <div className="text-[12px] font-semibold tracking-wider text-[#41454d] uppercase px-3">
              Navigation
            </div>
            <div className="flex flex-col space-y-2 text-[16px] text-[#181d26] font-medium">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-gray-50"
              >
                Home
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-gray-50"
              >
                About Us
              </Link>
              <Link
                href="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-gray-50"
              >
                Services
              </Link>
              <Link
                href="/dentists"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-gray-50"
              >
                Our Dentist
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-gray-50"
              >
                FAQs
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-gray-50"
              >
                Contact
              </Link>
              <Link
                href="/emergency"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-amber-800 bg-amber-50"
              >
                Emergency Care Info
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 space-y-3">
            <Link
              href="/request-appointment"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary w-full justify-center"
            >
              <Calendar className="w-5 h-5" />
              <span>{PRIMARY_CTA}</span>
            </Link>
            <a
              href={`tel:${CLINIC_PHONE_DIGITS}`}
              className="btn-secondary w-full justify-center"
            >
              <Phone className="w-5 h-5 text-[#0a2e0e]" />
              <span>Call {CLINIC_PHONE}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
