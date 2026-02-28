"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// ── Browser client (used in client components) ──────────────────────────────
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── Type helpers ─────────────────────────────────────────────────────────────
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
