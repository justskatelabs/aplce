import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">APLE</h1>
          <div className="flex gap-4">
            {user ? (
              <>
                <Link href="/diagnose" className="text-sm text-foreground hover:text-primary">
                  Start Diagnosis
                </Link>
                <Link href="/dashboard" className="text-sm text-foreground hover:text-primary">
                  Dashboard
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
              </>
            ) : (
              <Link href="/auth/login" className="text-sm text-foreground hover:text-primary">
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6 text-gray-900">
          Fast, Reliable Appliance Repairs
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          APLE connects appliance owners with qualified repair technicians in their area. Get diagnosed, estimate, and connected with a pro in minutes.
        </p>

        {user ? (
          <Link
            href="/diagnose"
            className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90"
          >
            Start Repair Diagnosis
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90"
          >
            Get Started
          </Link>
        )}
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h4 className="text-lg font-semibold mb-2">Diagnose</h4>
              <p className="text-gray-600">Chat with our AI assistant to diagnose your appliance issue</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h4 className="text-lg font-semibold mb-2">Estimate</h4>
              <p className="text-gray-600">Get an instant repair estimate based on complexity</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h4 className="text-lg font-semibold mb-2">Connect</h4>
              <p className="text-gray-600">We match you with the best available technician</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-6 text-center text-sm text-gray-600">
        <p>&copy; 2025 APLE - Appliance Repair Lead Platform</p>
      </footer>
    </main>
  );
}
