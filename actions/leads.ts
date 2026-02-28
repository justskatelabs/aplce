"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase";
import { calculateEstimate } from "@/lib/estimate";
import { findBestCompany } from "@/lib/matching";
import type { DiagnosisResult } from "@/lib/database.types";

const LeadFormSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string().regex(/^\d{10,15}$/),
  email: z.string().email(),
  zip: z.string().regex(/^\d{5}$/),
  address: z.string().min(5),
  diagnosis: z.custom<DiagnosisResult>(),
});

export type LeadFormState = {
  success: boolean;
  error?: string;
  leadId?: string;
};

export async function submitLead(
  _prev: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const raw = {
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    zip: formData.get("zip"),
    address: formData.get("address"),
    diagnosis: JSON.parse(formData.get("diagnosis") as string),
  };

  const parsed = LeadFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { full_name, phone, email, zip, address, diagnosis } = parsed.data;
  const estimate = calculateEstimate(diagnosis);

  const { data: companies } = await supabase.from("companies").select("*");
  const bestCompany = companies
    ? findBestCompany(companies as any, zip, diagnosis.brand, diagnosis.symptoms)
    : null;

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      customer_id: user.id,
      customer_name: full_name,
      customer_phone: phone,
      customer_email: email,
      customer_zip: zip,
      customer_address: address,
      diagnosis,
      estimate,
      status: bestCompany ? "assigned" : "pending",
      assigned_company_id: bestCompany?.id ?? null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  if (bestCompany) {
    const currentMetrics = (bestCompany.metrics as Record<string, unknown>) ?? {};
    const leadsThisWeek = ((currentMetrics.leads_this_week as number) ?? 0) + 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("companies") as any)
      .update({ metrics: { ...currentMetrics, leads_this_week: leadsThisWeek } })
      .eq("id", bestCompany.id);
  }

  return { success: true, leadId: (lead as any).id };
}

const UpdateLeadSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(["accepted", "rejected"]),
});

export async function updateLeadStatus(
  leadId: string,
  status: "accepted" | "rejected"
): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = UpdateLeadSchema.safeParse({ leadId, status });
  if (!parsed.success) return { error: "Invalid input" };

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!company) return { error: "Company not found" };

  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", leadId)
    .eq("assigned_company_id", company.id);

  return { error: error?.message };
}
