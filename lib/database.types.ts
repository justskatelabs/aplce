// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
// Minimal hand-written types until you generate:

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type DiagnosisResult = {
  appliance_type: string;
  year: number | null;
  brand: string;
  model: string;
  category: string;
  symptoms: string[];
  complexity: number; // 1-10
  estimated_parts: number; // USD
};

export type EstimateResult = {
  parts_cost: number;
  labor_cost: number;
  total_min: number;
  total_max: number;
  difficulty_multiplier: number;
};

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: "customer" | "company";
          full_name: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          zip_codes: string[];
          weekly_capacity: number;
          specialties: string[];
          metrics: Json;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["companies"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };
      leads: {
        Row: {
          id: string;
          customer_id: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          customer_zip: string;
          customer_address: string;
          diagnosis: DiagnosisResult;
          estimate: EstimateResult;
          status: "pending" | "assigned" | "accepted" | "rejected" | "completed";
          assigned_company_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["leads"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
