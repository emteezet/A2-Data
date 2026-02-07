"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function TransactionsPage() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
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
  }, []);

  const fetchTransactions = async (token) => {
    try {
      const res = await fetch("/api/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    if (filter === "all") return transactions;
    return transactions.filter((tx) => tx.type === filter);
  };

  const filteredTransactions = getFilteredTransactions();

  const getTotalSpent = () => {
    return transactions.reduce((sum, tx) => {
      if (tx.type === "data" || tx.type === "airtime") {
        return sum + (tx.amount || 0);
      }
      return sum;
    }, 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "successful":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "data":
        return "📊";
      case "airtime":
        return "📱";
      case "funding":
        return "💳";
      default:
        return "📋";
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
            <h1 className="text-2xl font-bold text-blue-600">Transactions</h1>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold">
                Total Transactions
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {transactions.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold">
                Total Spent
              </h3>
              <p className="text-3xl font-bold text-green-600">
                ₦{getTotalSpent().toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold">
                Recent Activity
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {transactions.length > 0
                  ? new Date(transactions[0]?.createdAt).toLocaleDateString()
                  : "N/A"}
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
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filter === f.value
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
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-6 text-center">Loading transactions...</div>
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
                          <span className="text-2xl">
                            {getTypeIcon(tx.type)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">
                            {tx.type === "data"
                              ? `${tx.network} - ${tx.dataSize}`
                              : tx.type === "airtime"
                                ? `${tx.network} Airtime`
                                : "Wallet Funding"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {tx.phoneNumber}
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
