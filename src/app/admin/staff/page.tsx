import { getStaffUsers } from "@/lib/admin-data";
import { UserCheck, ShieldAlert, Key, Mail, Phone } from "lucide-react";

export default async function AdminStaffPage() {
  const staffUsers = await getStaffUsers();


  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#dddddd]">
        <h1 className="text-[24px] font-medium text-[#181d26]">
          Staff Accounts & Role Permissions
        </h1>
        <p className="text-[13px] text-[#41454d]">
          Manage internal staff users and authorization levels: ADMIN, RECEPTIONIST, and DENTIST.
        </p>
      </div>

      <div className="space-y-4">
        {staffUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-xl border border-[#dddddd] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#181d26] text-white flex items-center justify-center font-semibold text-sm">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div>
                <h3 className="text-[16px] font-medium text-[#181d26]">
                  {user.firstName} {user.lastName}
                </h3>
                <div className="text-[12px] text-[#41454d] space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-md text-[12px] font-semibold tracking-wider uppercase ${
                  user.role === "ADMIN"
                    ? "bg-purple-100 text-purple-900 border border-purple-200"
                    : user.role === "DENTIST"
                    ? "bg-blue-100 text-blue-900 border border-blue-200"
                    : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                }`}
              >
                {user.role}
              </span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
