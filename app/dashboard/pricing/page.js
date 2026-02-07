"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function PricingPage() {
  const [user, setUser] = useState(null);
  const [networks, setNetworks] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      window.location.href = "/auth";
      return;
    }

    setUser(JSON.parse(userData));
    fetchNetworks(token);
  }, []);

  const fetchNetworks = async (token) => {
    try {
      const res = await fetch("/api/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNetworks(data.data);
        if (data.data.length > 0) {
          setSelectedNetwork(data.data[0]);
          fetchPlans(data.data[0]._id, token);
        }
      }
    } catch (err) {
      console.error("Error fetching networks:", err);
    }
  };

  const fetchPlans = async (networkId, token) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/data/${networkId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPlans(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNetworkChange = (network) => {
    setSelectedNetwork(network);
    const token = localStorage.getItem("token");
    fetchPlans(network._id, token);
  };

  const groupPlansBySize = () => {
    const grouped = {};
    plans.forEach((plan) => {
      if (!grouped[plan.dataSize]) {
        grouped[plan.dataSize] = [];
      }
      grouped[plan.dataSize].push(plan);
    });
    return grouped;
  };

  if (!user) return <div>Loading...</div>;

  const groupedPlans = groupPlansBySize();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-blue-600">
              Data Plans & Pricing
            </h1>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Network Selection */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">Select Network</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {networks.map((network) => (
                <button
                  key={network._id}
                  onClick={() => handleNetworkChange(network)}
                  className={`p-4 rounded-lg font-semibold transition ${
                    selectedNetwork?._id === network._id
                      ? "bg-blue-600 text-white border-2 border-blue-600"
                      : "bg-gray-100 border-2 border-gray-300 hover:border-blue-600"
                  }`}
                >
                  {network.name}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-lg p-6">
              <div className="text-4xl mb-2">⚡</div>
              <h3 className="font-bold text-lg mb-2">Instant Delivery</h3>
              <p className="text-sm opacity-90">
                Data delivered within seconds of purchase
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg p-6">
              <div className="text-4xl mb-2">💰</div>
              <h3 className="font-bold text-lg mb-2">Best Prices</h3>
              <p className="text-sm opacity-90">
                Competitive pricing across all networks
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-lg p-6">
              <div className="text-4xl mb-2">🔒</div>
              <h3 className="font-bold text-lg mb-2">Secure</h3>
              <p className="text-sm opacity-90">
                100% safe and secure transactions
              </p>
            </div>
          </div>

          {/* Plans */}
          {loading ? (
            <div className="text-center py-8 text-gray-600">
              Loading plans...
            </div>
          ) : plans.length > 0 ? (
            <div>
              <h3 className="text-2xl font-bold mb-6">
                {selectedNetwork?.name} Plans
              </h3>

              <div className="space-y-8">
                {Object.entries(groupedPlans).map(([size, sizePlans]) => (
                  <div key={size}>
                    <h4 className="text-lg font-bold mb-4 text-gray-700">
                      {size}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sizePlans.map((plan) => (
                        <div
                          key={plan._id}
                          className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                        >
                          <div className="mb-4">
                            <h5 className="font-bold text-lg text-gray-900">
                              {plan.dataSize}
                            </h5>
                            <p className="text-gray-600 text-sm">{plan.name}</p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-3xl font-bold text-blue-600">
                              ₦{plan.price.toLocaleString()}
                            </p>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <span className="mr-2">📅</span>
                              <span>Validity: {plan.validity}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-2">🔄</span>
                              <span>
                                Auto-renewal: {plan.autoRenewal ? "Yes" : "No"}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              (window.location.href = "/dashboard")
                            }
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                          >
                            Buy Now
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              No plans available for this network
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <h3 className="text-2xl font-bold mb-6">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">
                  How long does delivery take?
                </h4>
                <p className="text-gray-600">
                  Data is delivered within seconds of purchase. You can
                  immediately start using your data.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">
                  Can I get a refund?
                </h4>
                <p className="text-gray-600">
                  Refunds are not available for data purchases as they are
                  instantly delivered. However, you can contact our support team
                  for any issues.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">
                  What happens to unused data?
                </h4>
                <p className="text-gray-600">
                  Data expires based on the validity period. Once expired,
                  you'll need to purchase a new plan.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">
                  Are there any hidden charges?
                </h4>
                <p className="text-gray-600">
                  No! The price you see is what you pay. No hidden fees or
                  charges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
