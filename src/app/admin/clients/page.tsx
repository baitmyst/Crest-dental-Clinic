import { getClients } from "@/lib/admin-data";
import { Users, Phone, Mail, Calendar, Clock, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const clients = await getClients();


  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#dddddd]">
        <h1 className="text-[24px] font-medium text-[#181d26]">
          Internal Patient Directory (CRM)
        </h1>
        <p className="text-[13px] text-[#41454d]">
          Internal clinic client records created from guest booking submissions. Patients do not have online accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-xl border border-[#dddddd] p-6 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-[#181d26] text-white flex items-center justify-center font-medium text-sm">
                  {client.fullName.slice(0, 2).toUpperCase()}
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                    client.isReturningPatient
                      ? "bg-blue-100 text-blue-900"
                      : "bg-emerald-100 text-emerald-900"
                  }`}
                >
                  {client.isReturningPatient ? "Returning Patient" : "New Patient"}
                </span>
              </div>

              <div>
                <h3 className="text-[17px] font-medium text-[#181d26]">
                  {client.fullName}
                </h3>
                <div className="text-[13px] text-[#41454d] space-y-1 pt-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#08c068]" />
                    <a href={`tel:${client.phone}`} className="hover:underline">{client.phone}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#08c068]" />
                    <span>{client.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#dddddd] space-y-2 text-[12px]">
              <div className="flex justify-between text-[#41454d]">
                <span>Preferred Contact:</span>
                <span className="font-medium text-[#181d26] capitalize">
                  {client.preferredCommunicationMethod}
                </span>
              </div>
              <div className="flex justify-between text-[#41454d]">
                <span>Total Bookings:</span>
                <span className="font-semibold text-[#181d26]">
                  {client.appointments.length}
                </span>
              </div>
              {client.appointments.length > 0 && (
                <div className="p-2 bg-[#f8fafc] rounded border border-gray-200 text-[11px] text-[#333840]">
                  Latest: {client.appointments[0]?.service?.name || "Dental Care"} ({client.appointments[0]?.status})
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
