"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LoadingUI from "@/components/LoadingUI";
import CountUp from "@/components/CountUp";

const networkLogos = {
  "MTN": "/mtn-logo.svg",
  "Airtel": "/airtel-logo.svg",
  "Glo": "/glo-logo.svg",
  "9mobile": "/9mobile-logo.svg"
};

const getNetworkFromDescription = (description) => {
  if (!description) return null;
  const desc = description.toLowerCase();
  if (desc.includes("mtn")) return "MTN";
  if (desc.includes("airtel")) return "Airtel";
  if (desc.includes("glo")) return "Glo";
  if (desc.includes("9mobile")) return "9mobile";
  return null;
};

export default function DashboardHub() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
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

      if (!res.ok) {
        throw new Error(`Failed to fetch wallet: ${res.status} ${res.statusText}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response from server");
      }

      const data = await res.json();
      if (data.success) {
        setWallet(data.data);
      }
    } catch (err) {
      console.error("Error fetching wallet:", err.message);
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
        body: JSON.stringify({ action: "history", limit: 10 }),
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch transactions: ${res.status} ${res.statusText}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response from server");
      }

      const data = await res.json();
      if (data.success) {
        setTransactions(data.data.transactions || []);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err.message);
    }
  };

  if (!user) return <LoadingUI message="Preparing your dashboard..." />;

  const successfulTransactions = transactions.filter(t =>
    t.status === 'success' ||
    t.status === 'successful' ||
    t.status === 'completed'
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "successful":
      case "delivered":
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
      case "processing":
        return "bg-amber-100 text-amber-700";
      case "failed":
      case "rejected":
        return "bg-rose-100 text-rose-700";
      case "refunded":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTransactionLabel = (tx) => {
    if (tx.type === "data" || tx.type === "data_purchase" || tx.dataPlanId) {
      return `${tx.network || tx.networkId?.name || "Network"} Data`;
    }
    if (tx.type === "airtime" || tx.type === "airtime_purchase") {
      return `${tx.network || tx.networkId?.name || "Network"} Airtime`;
    }
    if (tx.type === "funding" || tx.type === "wallet_funding") {
      return "Wallet Funding";
    }
    // Deep fallback legacy check
    if (tx.type === "purchase") {
      return tx.dataPlanId ? `${tx.network || "Network"} Data` : `${tx.network || "Network"} Airtime`;
    }
    return "Transaction";
  };

  const getTransactionIcon = (type, tx = {}) => {
    if (type === "data" || type === "data_purchase" || tx.dataPlanId) return "📊";
    if (type === "airtime" || type === "airtime_purchase") return "📱";
    return "💳";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
      {/* Welcome Message */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome, {user.name}! 👋</h2>
        <p className="text-sm sm:text-base text-gray-600">Here's your account summary at a glance.</p>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-2">
              Available Balance
            </p>
            <div className="flex items-baseline justify-between">
              <p className="text-4xl font-black">
                ₦<CountUp end={wallet?.balance || 0} />
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
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            Success Transactions
          </p>
          <p className="text-4xl font-black text-gray-900">
            <CountUp end={successfulTransactions.length} />
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            Total Spent
          </p>
          <p className="text-4xl font-black text-blue-600">
            ₦<CountUp end={wallet?.totalSpent || 0} />
          </p>
        </div>
      </div>

      {/* Services Section */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href="/dashboard/buy-data"
            className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center space-x-6">
              <div className="text-5xl group-hover:scale-110 transition-transform duration-300">📊</div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">Buy Data</h4>
                <p className="text-gray-500">Fast and reliable data bundles for all networks.</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/airtime"
            className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center space-x-6">
              <div className="text-5xl group-hover:scale-110 transition-transform duration-300">📱</div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">Buy Airtime</h4>
                <p className="text-gray-500">Instant top-up for your mobile phone.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Recent Transactions</h3>
          <Link href="/dashboard/transactions" className="text-blue-600 font-semibold hover:underline">View All</Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {transactions.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl text-2xl">
                        {getTransactionIcon(tx.type, tx)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{getTransactionLabel(tx)}</h4>
                        <p className="text-sm text-gray-500">{new Date(tx.createdAt).toLocaleDateString()} • {tx.phoneNumber || tx.reference}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₦{tx.amount?.toLocaleString()}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              No transactions yet.
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/fund-wallet"
          className="flex items-center justify-between p-6 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <span className="text-2xl">💳</span>
            <span className="font-bold text-blue-900">Fund Your Wallet</span>
          </div>
          <span className="text-blue-600">→</span>
        </Link>

        <Link
          href="/dashboard/transactions"
          className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <span className="text-2xl">📋</span>
            <span className="font-bold text-gray-900">View History</span>
          </div>
          <span className="text-gray-600">→</span>
        </Link>
      </div>
    </div>
  );
}
