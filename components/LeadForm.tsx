"use client";

import { useActionState } from "react";
import { submitLead } from "@/actions/leads";
import type { DiagnosisResult, EstimateResult } from "@/lib/database.types";

interface LeadFormProps {
  diagnosis: DiagnosisResult;
  estimate: EstimateResult;
}

export function LeadForm({ diagnosis, estimate }: LeadFormProps) {
  const [state, formAction, isPending] = useActionState(submitLead, {
    success: false,
  });

  return (
    <form action={formAction} className="border rounded-lg p-6 bg-card space-y-4">
      <h3 className="text-lg font-semibold">Submit Your Repair Request</h3>

      {state.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {state.success ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          ✓ Your repair request has been submitted! We'll connect you with a qualified technician soon.
        </div>
      ) : (
        <>
          <input type="hidden" name="diagnosis" value={JSON.stringify(diagnosis)} />

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              required
              className="w-full px-3 py-2 border rounded-lg bg-background"
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone (10-15 digits) *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              pattern="\d{10,15}"
              required
              className="w-full px-3 py-2 border rounded-lg bg-background"
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-3 py-2 border rounded-lg bg-background"
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor="zip" className="block text-sm font-medium mb-1">
              ZIP Code (5 digits) *
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              pattern="\d{5}"
              required
              className="w-full px-3 py-2 border rounded-lg bg-background"
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              Address *
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              required
              className="w-full px-3 py-2 border rounded-lg bg-background"
              disabled={isPending}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Submitting..." : "Submit Repair Request"}
          </button>
        </>
      )}
    </form>
  );
}
