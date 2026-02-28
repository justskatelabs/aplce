"use client";

import { updateLeadStatus } from "@/actions/leads";
import { useState } from "react";
import type { Tables } from "@/lib/supabase";

type Lead = Tables<"leads">;

export default function DashboardTable({ leads: initial }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(leadId: string, status: "accepted" | "rejected") {
    setLoading(leadId);
    const { error } = await updateLeadStatus(leadId, status);
    if (!error) {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status } : l))
      );
    }
    setLoading(null);
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      assigned: "bg-blue-100 text-blue-700",
      accepted: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      completed: "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] ?? ""}`}>
        {status}
      </span>
    );
  };

  if (!leads.length) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-5xl mb-4">📭</div>
        <p className="font-medium">No leads assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
          <tr>
            {["Customer", "Appliance", "Brand", "Estimate", "Complexity", "Status", "Actions"].map((h) => (
              <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {leads.map((lead) => {
            const d = lead.diagnosis as any;
            const e = lead.estimate as any;
            return (
              <tr key={lead.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{lead.customer_name}</p>
                  <p className="text-xs text-gray-400">{lead.customer_zip}</p>
                </td>
                <td className="px-4 py-3 capitalize">{d?.appliance_type ?? "—"}</td>
                <td className="px-4 py-3">{d?.brand ?? "—"}</td>
                <td className="px-4 py-3 font-semibold">
                  ${e?.total_min} – ${e?.total_max}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold">{d?.complexity ?? "?"}</span>
                  <span className="text-gray-400">/10</span>
                </td>
                <td className="px-4 py-3">{statusBadge(lead.status)}</td>
                <td className="px-4 py-3">
                  {lead.status === "assigned" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(lead.id, "accepted")}
                        disabled={loading === lead.id}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleAction(lead.id, "rejected")}
                        disabled={loading === lead.id}
                        className="text-xs bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
