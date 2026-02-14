"use client";

const networkLogos = {
  "MTN": "/mtn-logo.svg",
  "Airtel": "/airtel-logo.svg",
  "Glo": "/glo-logo.svg",
  "9mobile": "/9mobile-logo.svg"
};

export default function HomePage() {
  const handleGetStarted = () => {
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      {/* Header */}
      <header className="bg-white bg-opacity-10 backdrop-blur-lg text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">A2 Data</h1>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition shadow-lg"
          >
            Get Started
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-white text-center mb-16">
          <h2 className="text-6xl font-black mb-6 leading-tight">Buy Data Instantly</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Fast, secure, and reliable data purchase platform for all Nigerian
            networks. Top up your data in seconds.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-yellow-400 text-blue-900 px-10 py-4 rounded-xl font-black text-xl hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-xl"
          >
            Start Buying Now
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="text-5xl mb-6">⚡</div>
            <h3 className="text-xl font-black mb-3 text-gray-900">Instant Delivery</h3>
            <p className="text-gray-600 leading-relaxed font-medium">
              Get your data delivered to your phone within seconds of purchase. No delays, ever.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="text-5xl mb-6">🔒</div>
            <h3 className="text-xl font-black mb-3 text-gray-900">Secure & Safe</h3>
            <p className="text-gray-600 leading-relaxed font-medium">
              Your transactions are encrypted and protected by modern, industry-standard
              security protocols.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="text-5xl mb-6">💰</div>
            <h3 className="text-xl font-black mb-3 text-gray-900">Best Rates</h3>
            <p className="text-gray-600 leading-relaxed font-medium">
              Competitive pricing on all networks - MTN, Airtel, Glo, and
              9mobile. Save more with A2 Data.
            </p>
          </div>
        </div>

        {/* Networks */}
        <div className="mt-24 bg-white/10 backdrop-blur-md rounded-3xl p-12 shadow-2xl border border-white/10">
          <h3 className="text-3xl font-black mb-12 text-center text-white">
            Supported Networks
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.keys(networkLogos).map((network) => (
              <div
                key={network}
                className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 group"
              >
                <div className="w-16 h-16 relative mb-4">
                  <img
                    src={networkLogos[network]}
                    alt={network}
                    className="w-full h-full object-contain filter group-hover:drop-shadow-md"
                  />
                </div>
                <span className="font-black text-gray-800 text-lg uppercase tracking-widest">{network}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-white text-lg mb-6">
            Join thousands of satisfied customers who trust A2 Data
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-300 transition"
          >
            Get Started for Free
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 bg-opacity-50 text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2026 A2 Data. All rights reserved. Made for Nigeria.</p>
        </div>
      </footer>
    </div>
  );
}
