"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";
import LoadingUI from "@/components/LoadingUI";

export default function BuyDataPage() {
    const { showNotification } = useNotification();
    const [user, setUser] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [networks, setNetworks] = useState([]);
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState("SME");
    const [transactions, setTransactions] = useState([]);
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
        fetchTransactions(token);
    }, []);

    const fetchTransactions = async (token) => {
        try {
            const res = await fetch("/api/wallet", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ action: "history", limit: 100 }),
            });
            const data = await res.json();
            if (data.success) {
                setTransactions(data.data.transactions || []);
            }
        } catch (err) {
            console.error("Error fetching transactions:", err);
        }
    };

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
        setFormData((prev) => ({ ...prev, dataPlanId: "" }));
    };

    const handleSelectType = (type) => {
        setSelectedType(type);
        setFormData((prev) => ({ ...prev, dataPlanId: "" }));
    };

    const handlePhoneChange = (e) => {
        setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }));
    };

    const handlePlanChange = (e) => {
        setFormData((prev) => ({ ...prev, dataPlanId: e.target.value }));
    };

    const handlePurchase = async () => {
        if (!formData.phoneNumber || !formData.dataPlanId) {
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
                    action: "purchase",
                    dataPlanId: formData.dataPlanId,
                    phoneNumber: formData.phoneNumber,
                }),
            });

            const data = await res.json();

            if (data.success) {
                showNotification("Purchase successful! Data will be delivered shortly.", "success");
                setFormData({ phoneNumber: "", dataPlanId: "" });
                fetchWallet(token);
                fetchTransactions(token);
            } else {
                showNotification(data.message || "Purchase failed", "error");
            }
        } catch (err) {
            showNotification("Error processing purchase", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <LoadingUI message="Loading data plans..." />;

    const filteredPlans = plans.filter((plan) => {
        return plan.type === selectedType;
    });

    const selectedPlan = plans.find((p) => p._id === formData.dataPlanId);

    return (
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
            {/* Account Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl p-6 shadow-lg relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">
                            Balance
                        </p>
                        <div className="flex items-baseline justify-between">
                            <p className="text-3xl font-black">
                                ₦{wallet?.balance.toLocaleString() || "0"}
                            </p>
                            <Link
                                href="/dashboard/fund-wallet"
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-[10px] font-bold py-1.5 px-3 rounded-full transition-all duration-300 flex items-center space-x-1"
                            >
                                <span>Add Fund</span>
                                <span className="text-sm">+</span>
                            </Link>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>
                </div>

                {/* Transactions Card */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                        Transactions
                    </p>
                    <p className="text-3xl font-black text-gray-900">
                        {transactions.length}
                    </p>
                </div>

                {/* Total Spent Card */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                        Total Spent
                    </p>
                    <p className="text-3xl font-black text-blue-600">
                        ₦{wallet?.totalSpent?.toLocaleString() || "0"}
                    </p>
                </div>
            </div>

            {/* New Single-Form Purchase Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">Buy Data Bundle</h2>
                </div>

                <div className="p-8 space-y-6">
                    {/* Network Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Network Provider
                        </label>
                        <select
                            value={selectedNetwork?._id || ""}
                            onChange={(e) => {
                                const network = networks.find((n) => n._id === e.target.value);
                                if (network) handleSelectNetwork(network);
                            }}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                            <option value="">Select a network</option>
                            {networks.map((network) => (
                                <option key={network._id} value={network._id}>
                                    {network.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Data Type Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Data Type
                        </label>
                        <div className="grid grid-cols-2 gap-3 max-w-sm">
                            <button
                                onClick={() => handleSelectType("SME")}
                                className={`py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${selectedType === "SME"
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    }`}
                            >
                                SME
                            </button>
                            <button
                                onClick={() => handleSelectType("Coupon")}
                                className={`py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${selectedType === "Coupon"
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    }`}
                            >
                                Coupon
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Plan Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Data Plan
                            </label>
                            <select
                                value={formData.dataPlanId}
                                onChange={handlePlanChange}
                                disabled={!selectedNetwork}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
                            >
                                <option value="">
                                    {!selectedNetwork
                                        ? "First select a network"
                                        : filteredPlans.length === 0
                                            ? "No plans match filters"
                                            : "Choose a plan"}
                                </option>
                                {filteredPlans.map((plan) => (
                                    <option key={plan._id} value={plan._id}>
                                        {plan.dataSize} - ₦{plan.price}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Amount Display */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Amount (₦)
                            </label>
                            <input
                                type="text"
                                value={selectedPlan ? `₦${selectedPlan.price.toLocaleString()}` : ""}
                                readOnly
                                placeholder="Amount to pay"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-bold outline-none"
                            />
                        </div>

                        {/* Phone Number Input */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={handlePhoneChange}
                                placeholder="08123456789"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Order Summary (Conditional) */}
                    {selectedPlan && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex justify-between items-center transform transition-all animate-fadeIn">
                            <div>
                                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1">
                                    Order Summary
                                </p>
                                <p className="text-sm font-bold text-blue-900">
                                    {selectedNetwork?.name} {selectedPlan.dataSize}
                                </p>
                                <p className="text-xs text-blue-600">{selectedType} Plan - {selectedPlan.validity}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-blue-700">
                                    ₦{selectedPlan.price.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Buy Button */}
                    <button
                        onClick={handlePurchase}
                        disabled={loading || !formData.dataPlanId || !formData.phoneNumber}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Processing Transaction...
                            </span>
                        ) : (
                            "Buy Now"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
