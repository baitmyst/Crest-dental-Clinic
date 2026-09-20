"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Edit,
  UserCheck,
  ChevronDown,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/services/supabase";

interface Appointment {
  id: string;
  referenceNumber: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  source: string;
  clientMessage?: string | null;
  internalNote?: string | null;
  createdAt: string;
  client: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
  };
  service: {
    id: string;
    name: string;
  };
  assignedDentist?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  } | null;
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [updating, setUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);

  // Modal edit fields
  const [newStatus, setNewStatus] = useState("");
  const [noteText, setNoteText] = useState("");

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/appointment-requests");
      const data = await res.json();
      if (res.ok) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error("Failed to load appointments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    // Supabase Realtime: listen for any INSERT or UPDATE on appointment_requests
    const channel = supabase
      .channel("admin-appointments-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointment_requests" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setRealtimeNotification("New appointment request received in real time!");
            setTimeout(() => setRealtimeNotification(null), 5000);
          }
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openEditModal = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setNewStatus(apt.status);
    setNoteText(apt.internalNote || "");
    setActionMessage(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedAppointment) return;
    setUpdating(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/appointment-requests/${selectedAppointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          internalNote: noteText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setActionMessage("Appointment updated successfully.");
      await fetchAppointments();
      setTimeout(() => {
        setSelectedAppointment(null);
      }, 1000);
    } catch (err: any) {
      setActionMessage("Error: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Filter logic
  const filtered = appointments.filter((apt) => {
    const matchesSearch =
      apt.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.client.phone.includes(searchQuery) ||
      apt.client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.service.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || apt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-semibold text-[11px] uppercase">Pending Review</span>;
      case "CONTACTED":
        return <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-900 font-semibold text-[11px] uppercase">Contacted</span>;
      case "CONFIRMED":
        return <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-semibold text-[11px] uppercase">Confirmed</span>;
      case "CHECKED_IN":
        return <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-900 font-semibold text-[11px] uppercase">Checked In</span>;
      case "IN_PROGRESS":
        return <span className="px-2.5 py-1 rounded bg-teal-100 text-teal-900 font-semibold text-[11px] uppercase">In Progress</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-1 rounded bg-gray-100 text-gray-800 font-semibold text-[11px] uppercase">Completed</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-1 rounded bg-red-100 text-red-900 font-semibold text-[11px] uppercase">Cancelled</span>;
      case "NO_SHOW":
        return <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-100 font-semibold text-[11px] uppercase">No Show</span>;
      default:
        return <span className="px-2.5 py-1 rounded bg-gray-100 text-gray-800 text-[11px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {realtimeNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg flex items-center gap-2.5 text-[13px] shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 animate-spin" />
          <span className="font-medium">{realtimeNotification}</span>
        </div>
      )}

      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#dddddd]">
        <div>
          <h1 className="text-[24px] font-medium text-[#181d26]">
            Appointment Request Management
          </h1>
          <p className="text-[13px] text-[#41454d]">
            Review pending guest booking requests, contact patients, assign dentists, and manage appointment lifecycles.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAppointments}
          className="btn-secondary text-[13px] py-1.5 px-3 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#08c068]" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#dddddd] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, ref #, phone, service..."
            className="w-full h-10 pl-10 pr-4 border border-[#dddddd] rounded-md text-[13px] focus:outline-none focus:border-[#181d26]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-[13px] text-[#41454d] font-medium whitespace-nowrap">
            Status Filter:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 border border-[#dddddd] rounded-md text-[13px] bg-white focus:outline-none focus:border-[#181d26] w-full md:w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="CONTACTED">Contacted</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>
      </div>

      {/* Table of Appointments */}
      <div className="bg-white rounded-xl border border-[#dddddd] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading clinic appointments...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500 space-y-2">
            <p className="font-medium">No appointment requests found matching your filter criteria.</p>
            <p className="text-[12px]">Try clearing your search query or selecting All Statuses.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#f8fafc] text-[#41454d] border-b border-[#dddddd]">
                <tr>
                  <th className="py-3 px-4 font-medium">Reference #</th>
                  <th className="py-3 px-4 font-medium">Patient Details</th>
                  <th className="py-3 px-4 font-medium">Service Requested</th>
                  <th className="py-3 px-4 font-medium">Requested Slot</th>
                  <th className="py-3 px-4 font-medium">Dentist</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dddddd]">
                {filtered.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50/80">
                    <td className="py-3.5 px-4 font-mono font-medium text-[#181d26]">
                      {apt.referenceNumber}
                      <span className="block text-[10px] text-gray-400 font-sans">
                        Source: {apt.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#181d26]">{apt.client.fullName}</div>
                      <div className="text-[12px] text-[#41454d] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#08c068]" />
                        <a href={`tel:${apt.client.phone}`} className="hover:underline">{apt.client.phone}</a>
                      </div>
                      <div className="text-[11px] text-gray-400">{apt.client.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#333840]">{apt.service.name}</div>
                      {apt.clientMessage && (
                        <div className="text-[11px] text-gray-500 italic truncate max-w-xs" title={apt.clientMessage}>
                          &ldquo;{apt.clientMessage}&rdquo;
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#181d26]">{apt.preferredDate}</div>
                      <div className="text-[12px] text-[#08c068] font-medium">{apt.preferredTime} (EAT)</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#333840]">
                      {apt.assignedDentist
                        ? `Dr. ${apt.assignedDentist.user.lastName}`
                        : "Dr. Silver (Lead)"}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(apt.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(apt)}
                        className="btn-secondary text-[12px] py-1.5 px-3"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#08c068]" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Manage & Update Appointment */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#dddddd] shadow-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#dddddd]">
              <div>
                <h3 className="text-[18px] font-medium text-[#181d26]">
                  Manage Request: {selectedAppointment.referenceNumber}
                </h3>
                <p className="text-[12px] text-[#41454d]">
                  Patient: {selectedAppointment.client.fullName} ({selectedAppointment.client.phone})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-400 hover:text-gray-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            {actionMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded text-[13px]">
                {actionMessage}
              </div>
            )}

            <div className="space-y-4 text-[13px]">
              <div>
                <label className="block font-medium text-[#181d26] mb-1">
                  Change Lifecycle Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full h-10 px-3 border border-[#dddddd] rounded-md focus:outline-none focus:border-[#181d26]"
                >
                  <option value="PENDING">PENDING (Awaiting phone call / review)</option>
                  <option value="CONTACTED">CONTACTED (Staff reached out to patient)</option>
                  <option value="CONFIRMED">CONFIRMED (Appointment locked & confirmed)</option>
                  <option value="CHECKED_IN">CHECKED_IN (Patient arrived at clinic)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Currently with dentist)</option>
                  <option value="COMPLETED">COMPLETED (Consultation complete)</option>
                  <option value="CANCELLED">CANCELLED (Patient or clinic cancelled)</option>
                  <option value="NO_SHOW">NO_SHOW (Patient did not attend)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#181d26] mb-1">
                  Internal Staff Notes
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                  placeholder="e.g. Called patient on 0700123456, confirmed they will arrive 10 mins early..."
                  className="w-full p-2.5 border border-[#dddddd] rounded-md focus:outline-none focus:border-[#181d26]"
                ></textarea>
              </div>

              <div className="p-3 bg-[#f8fafc] rounded-lg border border-[#dddddd] space-y-1 text-[12px] text-[#41454d]">
                <p><strong>Service:</strong> {selectedAppointment.service.name}</p>
                <p><strong>Preferred Slot:</strong> {selectedAppointment.preferredDate} at {selectedAppointment.preferredTime}</p>
                {selectedAppointment.clientMessage && (
                  <p><strong>Patient Note:</strong> {selectedAppointment.clientMessage}</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="btn-secondary text-[13px] py-2 px-3"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={handleUpdateStatus}
                className="btn-primary text-[13px] py-2 px-4"
              >
                {updating ? "Saving Changes..." : "Save Appointment Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
