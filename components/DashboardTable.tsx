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
      {/* Mobile card view */}
      <div className="sm:hidden space-y-3 p-4">
        {leads.map((lead) => {
          const diagnosis = lead.diagnosis as any;
          const estimate = lead.estimate as any;
          return (
            <div key={lead.id} className="border rounded-lg p-4 space-y-3 bg-card">
              <div>
                <p className="font-semibold text-sm">{lead.customer_name}</p>
                <p className="text-xs text-muted-foreground">{lead.customer_phone}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Appliance</p>
                  <p className="font-medium">{diagnosis?.appliance_type ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estimate</p>
                  <p className="font-medium">${estimate?.total_min?.toFixed(0) ?? "?"}-${estimate?.total_max?.toFixed(0) ?? "?"}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Issue</p>
                <p className="text-xs">{diagnosis?.symptoms?.join(", ") ?? "N/A"}</p>
              </div>
              <div className="flex items-center justify-between">
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
                {lead.status === "pending" || lead.status === "assigned" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(lead.id)}
                      disabled={isLoading === lead.id}
                      className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50 font-semibold min-h-[32px] flex items-center"
                    >
                      {isLoading === lead.id ? "..." : "Accept"}
                    </button>
                    <button
                      onClick={() => handleReject(lead.id)}
                      disabled={isLoading === lead.id}
                      className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 font-semibold min-h-[32px] flex items-center"
                    >
                      {isLoading === lead.id ? "..." : "Reject"}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table view */}
      <div className="hidden sm:block overflow-x-auto">
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
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50 font-semibold"
                        >
                          {isLoading === lead.id ? "..." : "Accept"}
                        </button>
                        <button
                          onClick={() => handleReject(lead.id)}
                          disabled={isLoading === lead.id}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 font-semibold"
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
      </div>

      {leads.length === 0 && (
        <div className="p-8 text-center text-muted-foreground text-sm">
          No leads yet
        </div>
      )}
    </div>
  );
}
