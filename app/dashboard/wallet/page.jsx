"use client";

import { useState, useEffect } from "react";
import LoadingUI from "@/components/LoadingUI";

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

export default function WalletSummaryPage() {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  });
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/auth";
      return;
    }

    const loadData = async () => {
      await fetchWallet(token);
      await fetchTransactions(token);
      setPageLoading(false);
    };

    loadData();
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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: "history", limit: 100 })
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch transactions: ${res.status} ${res.statusText}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response from server");
      }

      const data = await res.json();
      if (data.success && data.data) {
        setTransactions(data.data.transactions || []);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const spent = transactions
      .filter((tx) => tx.type === "data" || tx.type === "airtime")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const funded = transactions
      .filter((tx) => tx.type === "funding")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return { spent, funded };
  };

  if (pageLoading || !user || !wallet) {
    return <LoadingUI message="Preparing your wallet..." />;
  }

  const stats = calculateStats();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Main Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mb-8">
        <h2 className="text-lg font-semibold mb-2 opacity-90">
          Available Balance
        </h2>
        <p className="text-5xl font-bold mb-6">
          ₦{wallet.balance.toLocaleString()}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-700 bg-opacity-50 rounded-lg p-4">
            <p className="text-sm opacity-90">Total Funded</p>
            <p className="text-2xl font-bold">
              ₦{wallet.totalFunded.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-700 bg-opacity-50 rounded-lg p-4">
            <p className="text-sm opacity-90">Total Spent</p>
            <p className="text-2xl font-bold">
              ₦{stats.spent.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900">
                {transactions.length}
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Amount Funded</p>
              <p className="text-3xl font-bold text-green-600">
                ₦{stats.funded.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">💳</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Amount Spent</p>
              <p className="text-3xl font-bold text-red-600">
                ₦{stats.spent.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">💸</div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>

        {
          loading ? (
            <div className="text-center text-gray-600">Loading...</div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          {(() => {
                            const network = getNetworkFromDescription(tx.description);
                            const logo = network ? networkLogos[network] : null;
                            return logo ? (
                              <div className="w-8 h-8 flex-shrink-0 p-1 bg-gray-50 rounded-lg border border-gray-100">
                                <img src={logo} alt={network} className="w-full h-full object-contain" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg text-sm">
                                {tx.type === "funding" ? "💳" : "💸"}
                              </div>
                            );
                          })()}
                          <div>
                            <div className="font-bold text-gray-900 leading-tight">
                              {tx.description || "Transaction"}
                            </div>
                            {tx.reference && (
                              <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
                                Ref: {tx.reference}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-semibold capitalize">
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        <span
                          className={
                            tx.type === "credit"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {tx.type === "credit" ? "+" : "-"}₦
                          {tx.amount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${tx.status === "successful"
                            ? "bg-green-100 text-green-800"
                            : tx.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-600">
              No transactions yet
            </div>
          )
        }
      </div>

      {/* Wallet Information */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Wallet Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 text-sm">Wallet ID</p>
            <p className="font-semibold text-gray-900">{wallet._id}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Account Type</p>
            <p className="font-semibold text-gray-900">Primary</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Created On</p>
            <p className="font-semibold text-gray-900">
              {new Date(wallet.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Last Updated</p>
            <p className="font-semibold text-gray-900">
              {new Date(wallet.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
