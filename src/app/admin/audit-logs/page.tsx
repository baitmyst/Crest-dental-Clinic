import { prisma } from "@/lib/prisma";
import { ScrollText, ShieldCheck, User } from "lucide-react";

export default async function AdminAuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#dddddd]">
        <h1 className="text-[24px] font-medium text-[#181d26]">
          Security & Staff Audit Logs
        </h1>
        <p className="text-[13px] text-[#41454d]">
          Immutable record of staff logins, appointment status modifications, and clinical administrative operations.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#dddddd] shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No audit records captured yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#f8fafc] text-[#41454d] border-b border-[#dddddd]">
                <tr>
                  <th className="py-3 px-4 font-medium">Timestamp</th>
                  <th className="py-3 px-4 font-medium">Actor</th>
                  <th className="py-3 px-4 font-medium">Action</th>
                  <th className="py-3 px-4 font-medium">Target Entity</th>
                  <th className="py-3 px-4 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dddddd]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-500 text-[12px] whitespace-nowrap">
                      {log.createdAt.toLocaleDateString("en-UG")} {log.createdAt.toLocaleTimeString("en-UG")}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#181d26]">
                      {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : "System Event"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] bg-[#f8fafc] border border-[#dddddd] px-2 py-0.5 rounded text-[#0a2e0e]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#41454d]">
                      {log.entityType} ({log.entityId?.slice(0, 8) || "N/A"})
                    </td>
                    <td className="py-3 px-4 text-[12px] text-gray-500 font-mono truncate max-w-xs">
                      {log.metadataJson || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
