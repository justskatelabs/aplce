"use client";

import { useState } from "react";
import { acceptLead, rejectLead } from "@/actions/leads";
import type { Tables } from "@/lib/supabase";

type Lead = Tables<"leads">;

interface DashboardTableProps {
  leads: Lead[];
}

export function DashboardTable({ leads }: DashboardTableProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAccept = async (leadId: string) => {
    setIsLoading(leadId);
    const result = await acceptLead(leadId);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error ?? "Failed to accept lead");
    }
    setIsLoading(null);
  };

  const handleReject = async (leadId: string) => {
    setIsLoading(leadId);
    const result = await rejectLead(leadId);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error ?? "Failed to reject lead");
    }
    setIsLoading(null);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted border-b">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold">Customer</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Appliance</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Issue</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Estimate</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const diagnosis = lead.diagnosis as any;
            const estimate = lead.estimate as any;
            return (
              <tr key={lead.id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{lead.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{lead.customer_phone}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{diagnosis?.appliance_type ?? "N/A"}</td>
                <td className="px-4 py-3 text-sm">
                  {diagnosis?.symptoms?.join(", ") ?? "N/A"}
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  ${estimate?.total_min?.toFixed(2) ?? "?"} - ${estimate?.total_max?.toFixed(2) ?? "?"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      lead.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : lead.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  {lead.status === "pending" || lead.status === "assigned" ? (
                    <>
                      <button
                        onClick={() => handleAccept(lead.id)}
                        disabled={isLoading === lead.id}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                      >
                        {isLoading === lead.id ? "..." : "Accept"}
                      </button>
                      <button
                        onClick={() => handleReject(lead.id)}
                        disabled={isLoading === lead.id}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                      >
                        {isLoading === lead.id ? "..." : "Reject"}
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {leads.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No leads yet
        </div>
      )}
    </div>
  );
}
