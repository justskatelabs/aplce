"use client";

import { useState } from "react";
import { DiagnosticChat } from "@/components/DiagnosticChat";
import { EstimateCard } from "@/components/EstimateCard";
import { LeadForm } from "@/components/LeadForm";
import type { DiagnosisResult, EstimateResult } from "@/lib/database.types";
import { calculateEstimate } from "@/lib/estimate";

export default function DiagnosePage() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  const handleDiagnosisComplete = (diagResult: DiagnosisResult) => {
    setDiagnosis(diagResult);
  };

  const estimate = diagnosis ? calculateEstimate(diagnosis) : null;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-primary">Diagnose Your Appliance</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Chat Column */}
          <div className="md:col-span-2">
            <DiagnosticChat onDiagnosisComplete={handleDiagnosisComplete} />
          </div>

          {/* Right Column: Estimate & Form */}
          <div className="space-y-6">
            {estimate && diagnosis && (
              <>
                <EstimateCard estimate={estimate} />
                <LeadForm diagnosis={diagnosis} estimate={estimate} />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
