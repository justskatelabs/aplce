import type { DiagnosisResult, EstimateResult } from "./database.types";

export function calculateEstimate(diagnosis: DiagnosisResult): EstimateResult {
  const complexity = Math.min(Math.max(diagnosis.complexity, 1), 10);
  // Multiplier scales 1.2 → 3.0 across complexity 1 → 10
  const difficulty_multiplier = parseFloat(
    (1.2 + ((complexity - 1) / 9) * (3.0 - 1.2)).toFixed(2)
  );
  const parts_cost = diagnosis.estimated_parts;
  const labor_base = 75; // base hourly equivalent
  const labor_cost = parseFloat((labor_base * (complexity / 5)).toFixed(2));
  const subtotal = parts_cost + labor_cost;
  return {
    parts_cost,
    labor_cost,
    total_min: parseFloat((subtotal * 0.9).toFixed(2)),
    total_max: parseFloat((subtotal * difficulty_multiplier).toFixed(2)),
    difficulty_multiplier,
  };
}
