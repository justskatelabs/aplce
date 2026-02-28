import { createServerSupabaseClient } from "@/lib/supabase";
import { DashboardTable } from "@/components/DashboardTable";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Not authenticated</p>
      </div>
    );
  }

  // Get company for this user
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Get assigned leads
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("assigned_company_id", company?.id ?? "");

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <div className="flex gap-4">
            <Link href="/" className="text-sm text-foreground hover:text-primary">
              Home
            </Link>
            <form
              action={async () => {
                "use server";
                const supabase = await createServerSupabaseClient();
                await supabase.auth.signOut();
              }}
            >
              <button className="text-sm text-foreground hover:text-primary">Sign Out</button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {company ? (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">{company.name}</h2>
              <p className="text-sm text-muted-foreground">
                Service Areas: {(company.zip_codes as string[]).join(", ")} | 
                Capacity: {(company.metrics as any)?.leads_this_week ?? 0}/{company.weekly_capacity}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Assigned Leads</h3>
              <DashboardTable leads={leads || []} />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No company profile found</p>
            <p className="text-sm text-muted-foreground">Please contact support to set up your company account</p>
          </div>
        )}
      </div>
    </main>
  );
}
