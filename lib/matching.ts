import type { Tables } from "./supabase";

type Company = Tables<"companies"> & {
  metrics: {
    avg_response_time_hrs?: number;
    rating?: number;
    leads_this_week?: number;
  };
};

interface ScoringInput {
  company: Company;
  customerZip: string;
  brand: string;
  symptoms: string[];
}

function scoreCompany({ company, customerZip, brand, symptoms }: ScoringInput): number {
  const metrics = (company.metrics as Company["metrics"]) ?? {};

  // 40% — Specialization (brand + symptom keyword match)
  const specialtiesLower = company.specialties.map((s) => s.toLowerCase());
  const brandMatch = specialtiesLower.some((s) => s.includes(brand.toLowerCase())) ? 1 : 0;
  const symptomMatches = symptoms.filter((sym) =>
    specialtiesLower.some((s) => s.includes(sym.toLowerCase().split(" ")[0]))
  ).length;
  const specializationScore = Math.min(
    brandMatch * 0.6 + (symptomMatches / Math.max(symptoms.length, 1)) * 0.4,
    1
  );

  // 20% — Proximity (mock: matching zip prefix distance)
  const zipPrefix = (zip: string) => zip.slice(0, 3);
  const proximityScore =
    zipPrefix(customerZip) === zipPrefix(company.zip_codes[0] ?? "") ? 1 : 0.4;

  // 15% — Avg response time (lower is better; cap at 48hrs)
  const rt = metrics.avg_response_time_hrs ?? 12;
  const responseScore = Math.max(0, 1 - rt / 48);

  // 15% — Rating (0-5 scale)
  const ratingScore = (metrics.rating ?? 4) / 5;

  // 10% — Load balance (fewer leads this week = higher score)
  const leadsThisWeek = metrics.leads_this_week ?? 0;
  const loadScore = Math.max(0, 1 - leadsThisWeek / company.weekly_capacity);

  return (
    specializationScore * 0.4 +
    proximityScore * 0.2 +
    responseScore * 0.15 +
    ratingScore * 0.15 +
    loadScore * 0.1
  );
}

export function findBestCompany(
  companies: Company[],
  customerZip: string,
  brand: string,
  symptoms: string[]
): Company | null {
  const eligible = companies.filter((c) => {
    const metrics = (c.metrics as Company["metrics"]) ?? {};
    const leadsThisWeek = metrics.leads_this_week ?? 0;
    return (
      c.zip_codes.some(
        (z) => z.slice(0, 3) === customerZip.slice(0, 3) || z === customerZip
      ) && leadsThisWeek < c.weekly_capacity
    );
  });

  if (!eligible.length) return null;

  return eligible.reduce((best, c) => {
    const score = scoreCompany({ company: c, customerZip, brand, symptoms });
    const bestScore = scoreCompany({ company: best, customerZip, brand, symptoms });
    return score > bestScore ? c : best;
  });
}
