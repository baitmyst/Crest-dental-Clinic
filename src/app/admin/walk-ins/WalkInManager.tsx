"use client";

import React, { useState } from "react";
import {
  UserPlus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Phone,
  Mail,
  User,
  Activity,
  Stethoscope,
  X,
  FileText,
  Calendar,
  Filter,
  Check,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Service, DentistProfile } from "@/types/database";
import { WalkInRecord } from "@/services/walk-ins";

interface WalkInManagerProps {
  initialWalkIns: WalkInRecord[];
  services: Service[];
  dentists: DentistProfile[];
}

export default function WalkInManager({
  initialWalkIns,
  services,
  dentists,
}: WalkInManagerProps) {
  const [walkIns, setWalkIns] = useState<WalkInRecord[]>(initialWalkIns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Selected walk-in for viewing/updating
  const [selectedWalkIn, setSelectedWalkIn] = useState<WalkInRecord | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateNote, setUpdateNote] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    gender: "Not specified",
    emergencyContact: "",
    serviceId: services[0]?.id || "",
    assignedDentistId: "",
    priority: "ROUTINE" as "ROUTINE" | "URGENT" | "EMERGENCY",
    chiefComplaint: "",
    bloodPressure: "",
    temperature: "",
    staffNotes: "",
  });

  // Calculate statistics
  const todayStr = new Date().toISOString().split("T")[0];
  const todayWalkIns = walkIns.filter((w) => w.date === todayStr);
  const waitingCount = todayWalkIns.filter((w) => w.status === "CONFIRMED" || w.status === "PENDING").length;
  const emergencyCount = todayWalkIns.filter((w) => w.priority === "EMERGENCY" || w.priority === "URGENT").length;
  const completedCount = todayWalkIns.filter((w) => w.status === "COMPLETED").length;

  // Filter list
  const filteredWalkIns = walkIns.filter((w) => {
    const matchesSearch =
      w.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.clientPhone.includes(searchQuery) ||
      w.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.serviceName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === "ALL" || w.priority === priorityFilter;
    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "WAITING"
        ? w.status === "CONFIRMED" || w.status === "PENDING"
        : w.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const res = await fetch("/api/admin/walk-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register walk-in patient");
      }

      setFormSuccess(`Registered successfully! Reference: ${data.walkIn.referenceNumber}`);
      // Prepend to list
      setWalkIns((prev) => [data.walkIn, ...prev]);

      // Reset form
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        dateOfBirth: "",
        gender: "Not specified",
        emergencyContact: "",
        serviceId: services[0]?.id || "",
        assignedDentistId: "",
        priority: "ROUTINE",
        chiefComplaint: "",
        bloodPressure: "",
        temperature: "",
        staffNotes: "",
      });

      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: "CONFIRMED" | "COMPLETED" | "CANCELLED") => {
    if (!selectedWalkIn) return;
    setIsUpdatingStatus(true);

    try {
      const res = await fetch(`/api/admin/walk-ins/${selectedWalkIn.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          staffNotes: updateNote ? `${selectedWalkIn.internalNote || ""} | Note: ${updateNote}` : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update walk-in status");
      }

      // Update in local state
      setWalkIns((prev) =>
        prev.map((w) =>
          w.id === selectedWalkIn.id
            ? {
                ...w,
                status: newStatus,
                internalNote: data.walkIn?.internal_note || w.internalNote,
              }
            : w
        )
      );

      setSelectedWalkIn((prev) => (prev ? { ...prev, status: newStatus } : null));
      setUpdateNote("");
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const refreshList = async () => {
    try {
      const res = await fetch("/api/admin/walk-ins");
      const data = await res.json();
      if (data.walkIns) {
        setWalkIns(data.walkIns);
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#dddddd]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#08c068] animate-pulse"></span>
            <h1 className="text-[24px] font-semibold text-[#181d26]">
              Walk-in Patient Reception Desk
            </h1>
          </div>
          <p className="text-[13px] text-[#41454d] mt-1">
            Register and triage walk-in patients arriving without an online appointment. Synchronized directly with Supabase CRM and clinical queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshList}
            className="p-2.5 rounded-lg border border-[#dddddd] bg-white text-[#41454d] hover:bg-[#f8fafc] text-[13px] flex items-center gap-2 font-medium transition-colors shadow-sm"
            title="Refresh queue"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-[#08c068] hover:bg-[#06a85a] text-white text-[13px] font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Register Walk-in Patient
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#dddddd] shadow-sm">
          <div className="flex items-center justify-between text-[#41454d]">
            <span className="text-[12px] font-medium uppercase tracking-wider">Today's Walk-ins</span>
            <User className="w-4 h-4 text-[#1b61c9]" />
          </div>
          <div className="mt-2 text-[28px] font-bold text-[#181d26]">{todayWalkIns.length}</div>
          <div className="text-[11px] text-[#08c068] font-medium mt-1">Direct reception arrivals</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#dddddd] shadow-sm">
          <div className="flex items-center justify-between text-[#41454d]">
            <span className="text-[12px] font-medium uppercase tracking-wider">Waiting in Lobby</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-[28px] font-bold text-amber-600">{waitingCount}</div>
          <div className="text-[11px] text-[#41454d] mt-1">Awaiting consultation chair</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#dddddd] shadow-sm">
          <div className="flex items-center justify-between text-[#41454d]">
            <span className="text-[12px] font-medium uppercase tracking-wider">Priority / Urgent</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 text-[28px] font-bold text-red-600">{emergencyCount}</div>
          <div className="text-[11px] text-red-600 font-medium mt-1">Requires fast triage</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#dddddd] shadow-sm">
          <div className="flex items-center justify-between text-[#41454d]">
            <span className="text-[12px] font-medium uppercase tracking-wider">Treated & Discharged</span>
            <CheckCircle2 className="w-4 h-4 text-[#08c068]" />
          </div>
          <div className="mt-2 text-[28px] font-bold text-[#08c068]">{completedCount}</div>
          <div className="text-[11px] text-[#41454d] mt-1">Completed visits today</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#dddddd] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#41454d]" />
          <input
            type="text"
            placeholder="Search by patient name, phone number, reference (WI-...), or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#dddddd] rounded-lg text-[13px] focus:outline-none focus:border-[#08c068]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-[13px] text-[#41454d]">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[12px] font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-[#dddddd] rounded-lg px-2.5 py-1.5 text-[12px] bg-white focus:outline-none focus:border-[#08c068]"
            >
              <option value="ALL">All Priorities</option>
              <option value="ROUTINE">Routine</option>
              <option value="URGENT">Urgent Pain</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-[13px] text-[#41454d]">
            <span className="text-[12px] font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-[#dddddd] rounded-lg px-2.5 py-1.5 text-[12px] bg-white focus:outline-none focus:border-[#08c068]"
            >
              <option value="ALL">All Statuses</option>
              <option value="WAITING">Waiting in Lobby</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Walk-in Patients Table / List */}
      <div className="bg-white rounded-xl border border-[#dddddd] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#dddddd] flex items-center justify-between">
          <div className="font-semibold text-[15px] text-[#181d26]">
            Active Walk-in Queue & Records ({filteredWalkIns.length})
          </div>
          <div className="text-[12px] text-[#41454d]">
            Real-time patient tracking
          </div>
        </div>

        {filteredWalkIns.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f8fafc] border border-[#dddddd] flex items-center justify-center mx-auto text-[#41454d]">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="text-[16px] font-medium text-[#181d26]">No walk-in patients found</h3>
            <p className="text-[13px] text-[#41454d] max-w-sm mx-auto">
              {searchQuery || priorityFilter !== "ALL" || statusFilter !== "ALL"
                ? "No walk-in records matched your active filters."
                : "No walk-in patients registered yet. Click below to register patients arriving at reception."}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#08c068] text-white text-[13px] font-medium inline-flex items-center gap-2 hover:bg-[#06a85a]"
            >
              <UserPlus className="w-4 h-4" />
              Register First Walk-in
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#dddddd] text-[#41454d] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Ref & Arrival</th>
                  <th className="py-3 px-4">Patient Name & Phone</th>
                  <th className="py-3 px-4">Triage Priority</th>
                  <th className="py-3 px-4">Dental Service</th>
                  <th className="py-3 px-4">Assigned Dentist</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dddddd]">
                {filteredWalkIns.map((w) => {
                  const isWaiting = w.status === "CONFIRMED" || w.status === "PENDING";
                  return (
                    <tr
                      key={w.id}
                      className={`hover:bg-[#fcfdfe] transition-colors ${
                        w.priority === "EMERGENCY" && isWaiting ? "bg-red-50/40" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono text-[12px]">
                        <div className="font-semibold text-[#181d26]">{w.referenceNumber}</div>
                        <div className="text-[11px] text-[#41454d] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-[#08c068]" />
                          {w.date} at {w.arrivalTime}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#181d26] flex items-center gap-1.5">
                          {w.clientName}
                        </div>
                        <div className="text-[12px] text-[#41454d] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#08c068]" />
                          <a href={`tel:${w.clientPhone}`} className="hover:underline">
                            {w.clientPhone}
                          </a>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                            w.priority === "EMERGENCY"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : w.priority === "URGENT"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {w.priority === "EMERGENCY" && <AlertTriangle className="w-3 h-3" />}
                          {w.priority}
                        </span>
                        {w.chiefComplaint && (
                          <div className="text-[11px] text-[#41454d] truncate max-w-[160px] mt-1 italic">
                            "{w.chiefComplaint}"
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#181d26]">{w.serviceName}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[#181d26] font-medium">
                          {w.assignedDentistName || "General Queue"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                            isWaiting
                              ? "bg-amber-100 text-amber-900"
                              : w.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {isWaiting ? "In Lobby (Waiting)" : w.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedWalkIn(w)}
                          className="px-3 py-1.5 rounded-lg border border-[#dddddd] bg-white hover:bg-[#f8fafc] text-[12px] font-medium text-[#181d26] shadow-sm transition-colors"
                        >
                          Manage / Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#dddddd] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#dddddd] flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#08c068]/10 text-[#08c068] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-[#181d26]">
                    Register Walk-In Patient
                  </h2>
                  <p className="text-[12px] text-[#41454d]">
                    Quick front-desk registration for patients arriving without an appointment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#41454d] hover:bg-[#f8fafc] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Patient Personal Details */}
              <div className="space-y-3">
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#41454d]">
                  1. Patient Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[#181d26] mb-1">
                      Patient Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. John Mukasa"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 border border-[#dddddd] rounded-lg text-[13px] focus:outline-none focus:border-[#08c068]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#181d26] mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="e.g. +256 773 000111"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 border border-[#dddddd] rounded-lg text-[13px] focus:outline-none focus:border-[#08c068]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#181d26] mb-1">
                      Email Address <span className="text-xs text-[#41454d] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. patient@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 border border-[#dddddd] rounded-lg text-[13px] focus:outline-none focus:border-[#08c068]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#181d26] mb-1">
                      Date of Birth / Age <span className="text-xs text-[#41454d] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="dateOfBirth"
                      placeholder="YYYY-MM-DD or Age (e.g. 34)"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 border border-[#dddddd] rounded-lg text-[13px] focus:outline-none focus:border-[#08c068]"
                    />
                  </div>
                </div>
              </div>

              {/* Triage & Visit Details */}
              <div className="space-y-3 pt-2 border-t border-[#dddddd]">
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#41454d]">
                  2. Clinical Triage & Assignment
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[#181d26] mb-1">
                      Required Dental Service <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="serviceId"
                      required
                      value={formData.serviceId}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 border border-[#dddddd] rounded-lg text-[13px] bg-white focus:outline-none focus:border-[#08c068]"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.duration_minutes || 30} mins)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#181d26] mb-1">
                      Attending Dentist
                    </label>
                    <select
                      name="assignedDentistId"
                      value={formData.assignedDentistId}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 border border-[#dddddd] rounded-lg text-[13px] bg-white focus:outline-none focus:border-[#08c068]"
                    >
                      <option value="">Next Available Dentist (General Queue)</option>
                      {dentists.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.professional_title || "Dr."} {d.user?.first_name} {d.user?.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-medium text-[#181d26] mb-1">
                      Triage Priority Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <label
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-[13px] font-medium cursor-pointer transition-all ${
                          formData.priority === "ROUTINE"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                            : "border-[#dddddd] bg-white text-[#41454d]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value="ROUTINE"
                          checked={formData.priority === "ROUTINE"}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span>Routine / Checkup</span>
                      </label>

                      <label
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-[13px] font-medium cursor-pointer transition-all ${
                          formData.priority === "URGENT"
                            ? "border-amber-500 bg-amber-50 text-amber-900"
                            : "border-[#dddddd] bg-white text-[#41454d]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value="URGENT"
                          checked={formData.priority === "URGENT"}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span>Urgent Pain</span>
                      </label>

                      <label
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-[13px] font-medium cursor-pointer transition-all ${
                          formData.priority === "EMERGENCY"
                            ? "border-red-500 bg-red-50 text-red-900"
                            : "border-[#dddddd] bg-white text-[#41454d]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value="EMERGENCY"
                          checked={formData.priority === "EMERGENCY"}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span>Emergency / Trauma</span>
                      </label>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-medium text-[#181d26] mb-1">
                      Chief Complaint / Patient Symptoms
                    </label>
                    <textarea
                      name="chiefComplaint"
                      rows={2}
                      placeholder="e.g. Broken upper incisor from accidental fall, severe sensitivity to cold"
                      value={formData.chiefComplaint}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 border border-[#dddddd] rounded-lg text-[13px] focus:outline-none focus:border-[#08c068]"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Vitals & Reception Notes */}
              <div className="space-y-3 pt-2 border-t border-[#dddddd]">
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#41454d]">
                  3. Vitals & Reception Notes (Optional)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[#181d26] mb-1">
                      Blood Pressure (BP)
                    </label>
                    <input
                      type="text"
                      name="bloodPressure"
                      placeholder="e.g. 120/80"
                      value={formData.bloodPressure}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 border border-[#dddddd] rounded-lg text-[13px] focus:outline-none focus:border-[#08c068]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#181d26] mb-1">
                      Temperature (°C)
                    </label>
                    <input
                      type="text"
                      name="temperature"
                      placeholder="e.g. 36.6"
                      value={formData.temperature}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 border border-[#dddddd] rounded-lg text-[13px] focus:outline-none focus:border-[#08c068]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#181d26] mb-1">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      name="emergencyContact"
                      placeholder="e.g. Sarah (+256 700 000)"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 border border-[#dddddd] rounded-lg text-[13px] focus:outline-none focus:border-[#08c068]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#181d26] mb-1">
                    Internal Staff / Reception Note
                  </label>
                  <input
                    type="text"
                    name="staffNotes"
                    placeholder="e.g. Patient is in lobby wearing blue jacket, has valid dental insurance card"
                    value={formData.staffNotes}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 border border-[#dddddd] rounded-lg text-[13px] focus:outline-none focus:border-[#08c068]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#dddddd] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#dddddd] text-[#41454d] hover:bg-[#f8fafc] text-[13px] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg bg-[#08c068] hover:bg-[#06a85a] text-white text-[13px] font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Registering Patient...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirm & Add to Queue
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View & Update Modal */}
      {selectedWalkIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#dddddd] shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-[#dddddd] flex items-center justify-between">
              <div>
                <div className="text-[12px] font-mono text-[#08c068] font-semibold">
                  {selectedWalkIn.referenceNumber}
                </div>
                <h3 className="text-[17px] font-bold text-[#181d26]">
                  {selectedWalkIn.clientName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedWalkIn(null)}
                className="p-1.5 rounded-lg hover:bg-[#f8fafc] text-[#41454d]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-[13px]">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#f8fafc] rounded-xl border border-[#dddddd]">
                <div>
                  <div className="text-[11px] text-[#41454d] uppercase font-semibold">Phone</div>
                  <div className="font-medium text-[#181d26] mt-0.5">{selectedWalkIn.clientPhone}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#41454d] uppercase font-semibold">Arrival Time</div>
                  <div className="font-medium text-[#181d26] mt-0.5">
                    {selectedWalkIn.date} at {selectedWalkIn.arrivalTime}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#41454d] uppercase font-semibold">Service</div>
                  <div className="font-medium text-[#181d26] mt-0.5">{selectedWalkIn.serviceName}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#41454d] uppercase font-semibold">Dentist</div>
                  <div className="font-medium text-[#181d26] mt-0.5">
                    {selectedWalkIn.assignedDentistName || "General Queue"}
                  </div>
                </div>
              </div>

              {selectedWalkIn.chiefComplaint && (
                <div>
                  <div className="text-[11px] text-[#41454d] uppercase font-semibold">Chief Complaint</div>
                  <p className="p-2.5 bg-amber-50/50 border border-amber-200/60 rounded-lg text-amber-900 mt-1">
                    {selectedWalkIn.chiefComplaint}
                  </p>
                </div>
              )}

              {selectedWalkIn.internalNote && (
                <div>
                  <div className="text-[11px] text-[#41454d] uppercase font-semibold">Clinical & Vitals Note</div>
                  <p className="p-2.5 bg-[#f8fafc] border border-[#dddddd] rounded-lg text-[#181d26] mt-1 font-mono text-[12px]">
                    {selectedWalkIn.internalNote}
                  </p>
                </div>
              )}

              {/* Status Update Actions */}
              <div className="pt-3 border-t border-[#dddddd] space-y-3">
                <div className="text-[12px] font-semibold text-[#181d26]">Change Queue Status</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusChange("CONFIRMED")}
                    disabled={isUpdatingStatus || selectedWalkIn.status === "CONFIRMED"}
                    className={`py-2 px-3 rounded-lg text-[12px] font-medium border transition-colors ${
                      selectedWalkIn.status === "CONFIRMED"
                        ? "bg-amber-100 text-amber-900 border-amber-300 font-semibold"
                        : "border-[#dddddd] hover:bg-[#f8fafc] text-[#41454d]"
                    }`}
                  >
                    In Lobby
                  </button>

                  <button
                    onClick={() => handleStatusChange("COMPLETED")}
                    disabled={isUpdatingStatus || selectedWalkIn.status === "COMPLETED"}
                    className={`py-2 px-3 rounded-lg text-[12px] font-medium border transition-colors ${
                      selectedWalkIn.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold"
                        : "border-[#dddddd] hover:bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    Completed
                  </button>

                  <button
                    onClick={() => handleStatusChange("CANCELLED")}
                    disabled={isUpdatingStatus || selectedWalkIn.status === "CANCELLED"}
                    className={`py-2 px-3 rounded-lg text-[12px] font-medium border transition-colors ${
                      selectedWalkIn.status === "CANCELLED"
                        ? "bg-red-100 text-red-900 border-red-300 font-semibold"
                        : "border-[#dddddd] hover:bg-red-50 text-red-600"
                    }`}
                  >
                    Cancelled
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#41454d] mb-1">
                    Add Clinical / Reception Update Note
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Tooth extracted, patient given prescription"
                      value={updateNote}
                      onChange={(e) => setUpdateNote(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[#dddddd] rounded-lg text-[12px] focus:outline-none focus:border-[#08c068]"
                    />
                    <button
                      onClick={() => handleStatusChange(selectedWalkIn.status as any)}
                      disabled={isUpdatingStatus || !updateNote.trim()}
                      className="px-3 py-1.5 bg-[#181d26] text-white rounded-lg text-[12px] font-medium disabled:opacity-40"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#f8fafc] border-t border-[#dddddd] flex justify-end">
              <button
                onClick={() => setSelectedWalkIn(null)}
                className="px-4 py-1.5 bg-white border border-[#dddddd] rounded-lg text-[12px] font-medium text-[#181d26] hover:bg-[#f8fafc]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
