import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h1 className="text-2xl font-bold text-primary">APLE</h1>
          <div className="flex gap-4 w-full sm:w-auto">
            <Link href="/diagnose" className="text-sm text-foreground hover:text-primary py-2 px-3">
              Diagnosis
            </Link>
            <Link href="/auth/login" className="text-sm text-foreground hover:text-primary py-2 px-3">
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 text-balance">
          Fast, Reliable Appliance Repairs
        </h2>
        <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto text-balance">
          Connect with qualified repair technicians in your area. Get diagnosed, estimate, and matched in minutes.
        </p>

        <Link
          href="/auth/login"
          className="inline-block px-6 sm:px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity min-h-[44px] flex items-center justify-center text-base"
        >
          Get Started
        </Link>
      </section>

      {/* Features */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-balance">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h4 className="text-lg font-semibold mb-2">Diagnose</h4>
              <p className="text-gray-600 text-sm">Chat with our AI assistant to diagnose your appliance issue</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h4 className="text-lg font-semibold mb-2">Estimate</h4>
              <p className="text-gray-600 text-sm">Get an instant repair estimate based on complexity</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h4 className="text-lg font-semibold mb-2">Connect</h4>
              <p className="text-gray-600 text-sm">Matched with the best available technician</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-6 text-center text-xs sm:text-sm text-gray-600">
        <p>&copy; 2025 APLE - Appliance Repair Lead Platform</p>
      </footer>
    </main>
  );
}
