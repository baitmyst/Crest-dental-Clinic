"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Key, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";
import { CLINIC_NAME, CLINIC_CITY } from "@/lib/constants";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (role: "admin" | "receptionist" | "dentist") => {
    if (role === "admin") {
      setEmail("admin@crestdentalsurgery.com");
      setPassword("AdminPass2026!");
    } else if (role === "receptionist") {
      setEmail("receptionist@crestdentalsurgery.com");
      setPassword("ReceptPass2026!");
    } else if (role === "dentist") {
      setEmail("dr.silver@crestdentalsurgery.com");
      setPassword("SilverDentist2026!");
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#f8fafc] flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-[#08c068] text-white flex items-center justify-center font-semibold text-lg mx-auto shadow-sm">
          DC
        </div>
        <div>
          <h1 className="text-[24px] font-medium text-[#181d26] tracking-tight">
            Clinic Staff Portal
          </h1>
          <p className="text-[13px] text-[#41454d]">
            {CLINIC_NAME} · {CLINIC_CITY}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-xl border border-[#dddddd] shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[13px] flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#181d26] mb-1">
                Staff Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@crestdentalsurgery.com"
                  className="w-full h-11 pl-10 pr-4 border border-[#dddddd] rounded-md text-[14px] focus:outline-none focus:border-[#181d26]"
                  required
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#181d26] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-4 border border-[#dddddd] rounded-md text-[14px] focus:outline-none focus:border-[#181d26]"
                  required
                />
                <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center"
              >
                {loading ? "Signing in..." : "Access Internal Dashboard"}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="pt-4 border-t border-[#dddddd] space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#41454d] block">
              Quick Test Accounts:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount("admin")}
                className="p-2 border border-[#dddddd] hover:bg-gray-50 rounded text-[12px] font-medium text-[#181d26]"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount("receptionist")}
                className="p-2 border border-[#dddddd] hover:bg-gray-50 rounded text-[12px] font-medium text-[#181d26]"
              >
                Receptionist
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount("dentist")}
                className="p-2 border border-[#dddddd] hover:bg-gray-50 rounded text-[12px] font-medium text-[#181d26]"
              >
                Dr. Silver
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-[13px] text-[#41454d]">
          <Link href="/" className="hover:text-[#181d26]">
            &larr; Return to public clinic website
          </Link>
        </div>
      </div>
    </div>
  );
}
