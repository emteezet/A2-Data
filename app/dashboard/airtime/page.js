"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function AirtimePage() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [networks, setNetworks] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [amounts, setAmounts] = useState([]);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("select-network");

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

  const handleSelectNetwork = (network) => {
    setSelectedNetwork(network);
    const airtimeAmounts = [100, 200, 500, 1000, 2000, 5000];
    setAmounts(airtimeAmounts);
    setStep("select-amount");
  };

  const handlePurchase = async () => {
    if (!phoneNumber || !selectedAmount) {
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
          action: "airtime",
          network: selectedNetwork._id,
          amount: selectedAmount,
          phoneNumber: phoneNumber,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Airtime purchase successful!");
        setStep("select-network");
        setPhoneNumber("");
        setSelectedAmount(null);
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-blue-600">Buy Airtime</h1>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Wallet Balance */}
          {wallet && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold mb-2">Wallet Balance</h2>
              <p className="text-4xl font-bold">
                ₦{wallet.balance.toLocaleString()}
              </p>
            </div>
          )}

          {/* Purchase Section */}
          <div className="bg-white rounded-lg shadow p-6">
            {step === "select-network" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  Select Network Provider
                </h2>
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

            {step === "select-amount" && (
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
                  {selectedNetwork?.name} Airtime Amounts
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {amounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setSelectedAmount(amt)}
                      className={`p-4 border-2 rounded-lg transition font-semibold text-lg ${
                        selectedAmount === amt
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-300 hover:border-blue-600"
                      }`}
                    >
                      ₦{amt}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Network:</span>
                    <span className="font-semibold">
                      {selectedNetwork?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Amount:</span>
                    <span className="font-semibold">
                      ₦{selectedAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={loading || !phoneNumber || !selectedAmount}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Buy Airtime"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
