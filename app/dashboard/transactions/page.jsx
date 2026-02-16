"use client";

import { useState, useEffect } from "react";
import LoadingUI from "@/components/LoadingUI";

const networkLogos = {
  "MTN": "/mtn-logo.svg",
  "Airtel": "/airtel-logo.svg",
  "Glo": "/glo-logo.svg",
  "9mobile": "/9mobile-logo.svg"
};


export default function TransactionsPage() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      window.location.href = "/auth";
      return;
    }

    setUser(JSON.parse(userData));
    fetchTransactions(token);
    fetchWallet(token);
  }, []);

  const fetchWallet = async (token) => {
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "balance" }),
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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: "history", limit: 100 })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTransactions(data.data.transactions || []);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    if (filter === "all") return transactions;
    if (filter === "data") {
      return transactions.filter((tx) => tx.type === "data" || tx.type === "data_purchase" || tx.dataPlanId);
    }
    if (filter === "airtime") {
      return transactions.filter((tx) => tx.type === "airtime" || tx.type === "airtime_purchase" || (tx.type === "purchase" && !tx.dataPlanId));
    }
    if (filter === "funding") {
      return transactions.filter((tx) => tx.type === "funding" || tx.type === "wallet_funding");
    }
    return transactions.filter((tx) => tx.type === filter);
  };

  const filteredTransactions = getFilteredTransactions();

  const getTotalSpent = () => {
    return transactions.reduce((sum, tx) => {
      if (
        tx.status === "success" ||
        tx.status === "successful" ||
        tx.status === "completed"
      ) {
        if (
          tx.type === "data" ||
          tx.type === "airtime" ||
          tx.type === "data_purchase" ||
          tx.type === "airtime_purchase" ||
          (tx.type === "purchase" && tx.status !== "refunded")
        ) {
          return sum + (tx.amount || 0);
        }
      }
      return sum;
    }, 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
      case "successful":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
      case "processing":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "refunded":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type, tx = {}) => {
    if (type === "data" || type === "data_purchase" || tx.dataPlanId) return "📊";
    if (type === "airtime" || type === "airtime_purchase") return "📱";
    if (type === "funding" || type === "wallet_funding") return "💳";
    return "📋";
  };

  if (!user) return <LoadingUI message="Retrieving transaction history..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
            Wallet Balance
          </h3>
          <p className="text-3xl font-black text-gray-900">
            ₦{wallet?.balance?.toLocaleString() || "0"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
            Total Spent
          </h3>
          <p className="text-3xl font-black text-emerald-600">
            ₦{wallet?.totalSpent?.toLocaleString() || "0"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
            Total Transactions
          </h3>
          <p className="text-3xl font-black text-purple-600">
            {transactions.length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "All" },
            { value: "data", label: "Data" },
            { value: "airtime", label: "Airtime" },
            { value: "funding", label: "Funding" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${filter === f.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      < div className="bg-white rounded-lg shadow overflow-hidden" >
        {
          loading ? (
            <div className="p-6 text-center" > Loading transactions...</div>
          ) : filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Details
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx._id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          {(() => {
                            const logo = networkLogos[tx.network];
                            return logo ? (
                              <div className="w-8 h-8 flex-shrink-0 p-1 bg-gray-50 rounded-lg border border-gray-100">
                                <img src={logo} alt={tx.network} className="w-full h-full object-contain" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg text-sm">
                                {getTypeIcon(tx.type, tx)}
                              </div>
                            );
                          })()}
                          <div>
                            <div className="font-bold text-gray-900 leading-tight">
                              {tx.type === "data" || tx.type === "data_purchase" || tx.dataPlanId
                                ? `${tx.network || tx.networkId?.name || "Network"} - ${tx.dataSize || tx.dataPlanId?.dataSize || "Data"}`
                                : tx.type === "airtime" || tx.type === "airtime_purchase"
                                  ? `${tx.network || tx.networkId?.name || "Network"} Airtime`
                                  : tx.type === "funding" || tx.type === "wallet_funding"
                                    ? "Wallet Funding"
                                    : tx.type === "purchase"
                                      ? (tx.dataPlanId ? `${tx.network || "Network"} Data` : `${tx.network || "Network"} Airtime`)
                                      : "Transaction"}
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
                              {tx.phoneNumber || tx.reference || "Transaction"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold">
                        ₦{tx.amount?.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                            tx.status,
                          )}`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-600">
              No transactions found
            </div>
          )
        }
      </div>
    </div>
  );
}
