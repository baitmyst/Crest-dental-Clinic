import { getNotifications } from "@/lib/admin-data";
import { Bell, Mail, MessageSquare, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const notifications = await getNotifications();


  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#dddddd]">
        <h1 className="text-[24px] font-medium text-[#181d26]">
          Notification Queue & Delivery Logs
        </h1>
        <p className="text-[13px] text-[#41454d]">
          Outbound email, SMS, and WhatsApp alerts dispatched to staff and patients following appointment actions.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#dddddd] shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No outgoing notifications dispatched yet.
          </div>
        ) : (
          <div className="divide-y divide-[#dddddd] text-[13px]">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 space-y-1.5 hover:bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-semibold uppercase">
                      {n.channel}
                    </span>
                    <strong className="text-[#181d26]">{n.subject || n.type}</strong>
                  </div>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {n.status}
                  </span>
                </div>

                <p className="text-[#41454d]">{n.body}</p>

                <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1">
                  <span>Recipient: {n.recipient}</span>
                  <span>{n.createdAt.toLocaleTimeString("en-UG")} · {n.createdAt.toLocaleDateString("en-UG")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
