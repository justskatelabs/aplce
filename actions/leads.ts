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
  const { data: { user } } = await supabase.auth.getUser();
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

  // Find matching company
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
    .select()
    .single();

  if (error || !lead) {
    return { success: false, error: error?.message ?? "Failed to submit lead" };
  }

  // Update company metrics if assigned
  if (bestCompany) {
    const currentMetrics = (bestCompany.metrics as any) ?? {};
    const leadsThisWeek = (currentMetrics.leads_this_week ?? 0) + 1;

    await supabase
      .from("companies")
      .update({
        metrics: { ...currentMetrics, leads_this_week: leadsThisWeek },
      })
      .eq("id", bestCompany.id);
  }

  return { success: true, leadId: lead.id };
}

export type LeadActionState = {
  success: boolean;
  error?: string;
};

export async function acceptLead(leadId: string): Promise<LeadActionState> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Verify company ownership
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!company) return { success: false, error: "Company not found" };

  const { error } = await supabase
    .from("leads")
    .update({ status: "accepted" })
    .eq("id", leadId)
    .eq("assigned_company_id", company.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function rejectLead(leadId: string): Promise<LeadActionState> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Verify company ownership
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!company) return { success: false, error: "Company not found" };

  const { error } = await supabase
    .from("leads")
    .update({ status: "rejected" })
    .eq("id", leadId)
    .eq("assigned_company_id", company.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
