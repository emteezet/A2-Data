"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [networks, setNetworks] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("select-network");
  const [formData, setFormData] = useState({
    phoneNumber: "",
    dataPlanId: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      window.location.href = "/auth";
      return;
    }

    setUser(JSON.parse(userData));
    fetchWallet(token);
    fetchNetworks(token);
  }, []);

  const fetchWallet = async (token) => {
    try {
      const res = await fetch("/api/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setWallet(data.data);
      }
    } catch (err) {
      console.error("Error fetching wallet:", err);
    }
  };

  const fetchNetworks = async (token) => {
    try {
      const res = await fetch("/api/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNetworks(data.data);
      }
    } catch (err) {
      console.error("Error fetching networks:", err);
    }
  };

  const fetchPlans = async (networkId, token) => {
    try {
      const res = await fetch(`/api/data/${networkId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  const handleSelectNetwork = (network) => {
    setSelectedNetwork(network);
    const token = localStorage.getItem("token");
    fetchPlans(network._id, token);
    setStep("select-plan");
  };

  const handleSelectPlan = (plan) => {
    setFormData((prev) => ({ ...prev, dataPlanId: plan._id }));
    setStep("enter-phone");
  };

  const handlePhoneChange = (e) => {
    setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }));
  };

  const handlePurchase = async () => {
    if (!formData.phoneNumber || !formData.dataPlanId) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "purchase",
          dataPlanId: formData.dataPlanId,
          phoneNumber: formData.phoneNumber,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Purchase successful! Data will be delivered shortly.");
        setStep("select-network");
        setFormData({ phoneNumber: "", dataPlanId: "" });
        setSelectedNetwork(null);
        fetchWallet(token);
      } else {
        alert(data.message || "Purchase failed");
      }
    } catch (err) {
      alert("Error processing purchase");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  const selectedPlan = plans.find((p) => p._id === formData.dataPlanId);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">DataApp</h1>
            <span className="text-gray-700">{user.name}</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Wallet Balance */}
          {wallet && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold mb-2">Wallet Balance</h2>
              <p className="text-4xl font-bold">
                ₦{wallet.balance.toLocaleString()}
              </p>
              <p className="text-blue-100 mt-2">
                Total Funded: ₦{wallet.totalFunded.toLocaleString()}
              </p>
            </div>
          )}

          {/* Purchase Section */}
          <div className="bg-white rounded-lg shadow p-6">
            {step === "select-network" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Select Network</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {networks.map((network) => (
                    <button
                      key={network._id}
                      onClick={() => handleSelectNetwork(network)}
                      className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center font-semibold"
                    >
                      {network.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === "select-plan" && (
              <div>
                <button
                  onClick={() => {
                    setStep("select-network");
                    setSelectedNetwork(null);
                  }}
                  className="mb-4 text-blue-600 hover:underline"
                >
                  ← Back
                </button>
                <h2 className="text-2xl font-bold mb-6">
                  {selectedNetwork?.name} Plans
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <button
                      key={plan._id}
                      onClick={() => handleSelectPlan(plan)}
                      className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-left"
                    >
                      <p className="font-bold text-lg">{plan.dataSize}</p>
                      <p className="text-gray-600">{plan.name}</p>
                      <p className="text-gray-500 text-sm">
                        Validity: {plan.validity}
                      </p>
                      <p className="text-blue-600 font-bold mt-2">
                        ₦{plan.price}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === "enter-phone" && (
              <div>
                <button
                  onClick={() => {
                    setStep("select-plan");
                    setFormData((prev) => ({ ...prev, dataPlanId: "" }));
                  }}
                  className="mb-4 text-blue-600 hover:underline"
                >
                  ← Back
                </button>
                <h2 className="text-2xl font-bold mb-6">Confirm Purchase</h2>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-700">Network:</span>
                    <span className="font-semibold">
                      {selectedNetwork?.name}
                    </span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-700">Plan:</span>
                    <span className="font-semibold">
                      {selectedPlan?.dataSize} - ₦{selectedPlan?.price}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Buy Now"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
