"use client";

import type { EstimateResult } from "@/lib/database.types";

interface EstimateCardProps {
  estimate: EstimateResult;
}

export function EstimateCard({ estimate }: EstimateCardProps) {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h3 className="text-lg font-semibold mb-4">Repair Estimate</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Parts Cost:</span>
          <span className="font-medium">${estimate.parts_cost.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Labor Cost:</span>
          <span className="font-medium">${estimate.labor_cost.toFixed(2)}</span>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-muted-foreground">Estimated Range:</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Min:</span>
            <span className="font-medium">${estimate.total_min.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Max:</span>
            <span className="font-medium">${estimate.total_max.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Complexity Multiplier:</span>
            <span className="text-sm">{estimate.difficulty_multiplier.toFixed(2)}x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
