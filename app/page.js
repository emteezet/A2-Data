"use client";

export default function HomePage() {
  const handleGetStarted = () => {
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      {/* Header */}
      <header className="bg-white bg-opacity-10 backdrop-blur-lg text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">A2 Data</h1>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Get Started
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-white text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Buy Data Instantly</h2>
          <p className="text-xl text-blue-100 mb-8">
            Fast, secure, and reliable data purchase platform for all Nigerian
            networks
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-300 transition"
          >
            Start Buying Now
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Instant Delivery</h3>
            <p className="text-gray-600">
              Get your data delivered to your phone within seconds of purchase
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">Secure & Safe</h3>
            <p className="text-gray-600">
              Your transactions are encrypted and protected by industry-standard
              security
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Best Rates</h3>
            <p className="text-gray-600">
              Competitive pricing on all networks - MTN, Airtel, Glo, and
              9mobile
            </p>
          </div>
        </div>

        {/* Networks */}
        <div className="mt-16 bg-white rounded-lg p-8 shadow-lg">
          <h3 className="text-2xl font-bold mb-8 text-center">
            Supported Networks
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["MTN", "Airtel", "Glo", "9mobile"].map((network) => (
              <div
                key={network}
                className="bg-gray-100 p-6 rounded-lg text-center font-bold"
              >
                {network}
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
