"use client";

import { useState, useEffect } from "react";
import LoadingUI from "@/components/LoadingUI";
import CountUp from "@/components/CountUp";


export default function FundWalletPage() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      window.location.href = "/auth";
      return;
    }

    setUser(JSON.parse(userData));
    fetchWallet(token);
    fetchTransactions(token);
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

  const fetchTransactions = async (token) => {
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "history", limit: 10, type: "wallet_funding" }),
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data.transactions || []);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const handleFundWallet = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/wallet/paystack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "initialize",
          email: user.email,
          amount: parseFloat(amount),
        }),
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = data.data.authorizationUrl;
      } else {
        alert(data.message || "Failed to initiate funding");
      }
    } catch (err) {
      alert("Error processing funding request");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <LoadingUI message="Connecting to secure payment systems..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
      {/* Content */}
      {/* Wallet Balance */}
      {wallet && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-6">
          <h2 className="text-base font-semibold mb-1 opacity-90">Current Balance</h2>
          <p className="text-3xl sm:text-4xl font-bold">
            ₦<CountUp end={wallet.balance || 0} />
          </p>
          <p className="text-blue-100 text-sm mt-1">
            Total Funded: ₦<CountUp end={wallet.totalFunded || 0} />
          </p>
        </div>
      )}

      {/* Funding Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Quick Amounts</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {[1000, 2500, 5000, 10000].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt.toString())}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold transition ${amount === amt.toString()
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Enter Amount</h3>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Amount (₦)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-xl font-bold"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">
                ₦{parseFloat(amount || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fee:</span>
              <span className="font-semibold">Calculated at checkout</span>
            </div>
          </div>

          <button
            onClick={handleFundWallet}
            disabled={loading || !amount}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
          <p className="text-gray-600 text-sm mt-4 text-center">
            🔒 Secure payment powered by Paystack
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Recent Funding History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Date</th>
                  <th className="text-left py-2 px-4">Amount</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Reference</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((tx) => (
                  <tr key={tx._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      ₦{tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-sm font-semibold ${tx.status?.toLowerCase() === "successful" || tx.status?.toLowerCase() === "success"
                          ? "bg-emerald-100 text-emerald-800"
                          : tx.status?.toLowerCase() === "pending" || tx.status?.toLowerCase() === "processing"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                          }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {tx.reference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
