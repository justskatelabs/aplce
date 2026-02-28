import { createServerSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export default async function CallbackRoute(props: {
  searchParams: Promise<{ code?: string }>;
}) {
  const searchParams = await props.searchParams;
  const code = searchParams.code;

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  redirect("/");
}
