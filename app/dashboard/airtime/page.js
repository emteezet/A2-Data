"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";
import LoadingUI from "@/components/LoadingUI";


export default function AirtimePage() {
  const { showNotification } = useNotification();
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
      showNotification("Please fill all fields", "warning");
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
        showNotification("Airtime purchase successful!", "success");
        setStep("select-network");
        setPhoneNumber("");
        setSelectedAmount(null);
        setSelectedNetwork(null);
        fetchWallet(token);
      } else {
        showNotification(data.message || "Purchase failed", "error");
      }
    } catch (err) {
      showNotification("Error processing purchase", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <LoadingUI message="Setting up Secure payment gateway..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Wallet Balance */}
      {wallet && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-6 mb-8 relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-2">Wallet Balance</h2>
            <div className="flex items-center justify-between">
              <p className="text-4xl font-black">
                ₦{wallet.balance.toLocaleString()}
              </p>
              <Link
                href="/dashboard/fund-wallet"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-bold py-2 px-4 rounded-full transition-all duration-300 flex items-center space-x-2"
              >
                <span>Add Fund</span>
                <span className="text-lg">+</span>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
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
                  className={`p-4 border-2 rounded-lg transition font-semibold text-lg ${selectedAmount === amt
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
  );
}
