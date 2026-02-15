"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";
import LoadingUI from "@/components/LoadingUI";
import SuccessModal from "@/components/SuccessModal";
import ErrorModal from "@/components/ErrorModal";
import CountUp from "@/components/CountUp";
import Image from "next/image";

const networkLogos = {
    "MTN": "/mtn-logo.svg",
    "Airtel": "/airtel-logo.svg",
    "Glo": "/glo-logo.svg",
    "9mobile": "/9mobile-logo.svg"
};

export default function BuyDataPage() {
    return (
        <Suspense fallback={<LoadingUI message="Loading purchase page..." />}>
            <BuyDataContent />
        </Suspense>
    );
}

function BuyDataContent() {
    const { showNotification } = useNotification();
    const [user, setUser] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [networks, setNetworks] = useState([]);
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [errorModal, setErrorModal] = useState({ isOpen: false, title: "", message: "" });
    const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });
    const [formData, setFormData] = useState({
        phoneNumber: "",
        dataPlanId: "",
    });
    const searchParams = useSearchParams();
    const phoneInputRef = useRef(null);

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

        // Handle URL parameters
        const networkId = searchParams.get("networkId");
        const planId = searchParams.get("planId");
        if (networkId) {
            fetchPlans(networkId, token);
            // We'll set the planId in another effect once plans are loaded
        }
    }, [searchParams]);

    // Handle plan selection from URL parameters once plans are loaded
    useEffect(() => {
        const planId = searchParams.get("planId");
        const networkId = searchParams.get("networkId");

        if (planId && plans.length > 0) {
            setFormData(prev => ({ ...prev, dataPlanId: planId }));
            // Focus phone input when a plan is pre-selected
            if (phoneInputRef.current) {
                phoneInputRef.current.focus();
            }
        }

        if (networkId && networks.length > 0) {
            const network = networks.find(n => n._id === networkId);
            if (network) setSelectedNetwork(network);
        }
    }, [plans, networks, searchParams]);

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

    const fetchNetworks = async (token) => {
        try {
            const res = await fetch("/api/data", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch networks: ${res.status} ${res.statusText}`);
            }

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Received non-JSON response from server");
            }

            const data = await res.json();
            if (data.success) {
                setNetworks(data.data);
            }
        } catch (err) {
            console.error("Error fetching networks:", err.message);
        }
    };

    const fetchPlans = async (networkId, token) => {
        try {
            const res = await fetch(`/api/data/${networkId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch plans: ${res.status} ${res.statusText}`);
            }

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Received non-JSON response from server");
            }

            const data = await res.json();
            if (data.success) {
                setPlans(data.data);
            }
        } catch (err) {
            console.error("Error fetching plans:", err.message);
        }
    };

    const handleSelectNetwork = (network) => {
        setSelectedNetwork(network);
        const token = localStorage.getItem("token");
        fetchPlans(network._id, token);
        setFormData((prev) => ({ ...prev, dataPlanId: "" }));
    };


    const handlePhoneChange = (e) => {
        setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }));
    };

    const handlePlanChange = (e) => {
        setFormData((prev) => ({ ...prev, dataPlanId: e.target.value }));
    };

    // Network detection and validation
    useEffect(() => {
        if (formData.phoneNumber.length >= 4) {
            const detected = detectNetwork(formData.phoneNumber);
            if (detected) {
                const networkObj = networks.find(n => n.name.toLowerCase() === detected.toLowerCase());
                if (networkObj && (!selectedNetwork || selectedNetwork.name !== detected)) {
                    setSelectedNetwork(networkObj);
                }
            } else {
                setSelectedNetwork(null);
            }
        } else {
            setSelectedNetwork(null);
        }
    }, [formData.phoneNumber, networks]);

    const detectNetwork = (num) => {
        let cleanNumber = num.replace(/\D/g, '');
        if (cleanNumber.startsWith('234')) {
            cleanNumber = '0' + cleanNumber.slice(3);
        } else if (!cleanNumber.startsWith('0') && cleanNumber.length === 10) {
            cleanNumber = '0' + cleanNumber;
        }
        const prefix = cleanNumber.substring(0, 4);
        const prefixes = {
            MTN: ['0703', '0706', '0803', '0806', '0810', '0813', '0814', '0816', '0903', '0906', '0913', '0916', '0702', '0704'],
            Airtel: ['0701', '0708', '0802', '0808', '0812', '0901', '0902', '0904', '0907', '0912', '0917'],
            Glo: ['0705', '0805', '0807', '0811', '0815', '0905', '0915'],
            '9mobile': ['0809', '0817', '0818', '0908', '0909']
        };
        for (const [network, prefList] of Object.entries(prefixes)) {
            if (prefList.includes(prefix)) return network;
        }
        return null;
    };

    const validatePhone = (num) => {
        const re = /^(\+234|234|0)(70|80|81|90|91)\d{8}$/;
        return re.test(num.replace(/\s/g, ""));
    };

    const normalizeForApi = (num) => {
        let cleanNumber = num.replace(/\D/g, '');
        if (cleanNumber.startsWith('0')) return '234' + cleanNumber.slice(1);
        if (cleanNumber.startsWith('234')) return cleanNumber;
        return '234' + cleanNumber;
    };

    const handlePurchase = async () => {
        if (!formData.phoneNumber || !formData.dataPlanId) {
            showNotification("Please fill all fields", "warning");
            return;
        }

        if (!validatePhone(formData.phoneNumber)) {
            showNotification("Invalid Nigerian phone number format", "error");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem("token");
        const idempotencyKey = `DATA-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

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
                    phoneNumber: normalizeForApi(formData.phoneNumber),
                    idempotencyKey,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setFormData({ phoneNumber: "", dataPlanId: "" });
                fetchWallet(token);
                fetchTransactions(token);
                setSuccessModal({
                    isOpen: true,
                    title: "Purchase Successful",
                    message: `Your data purchase for ${normalizeForApi(formData.phoneNumber)} was successful. Data will be delivered shortly.`
                });
            } else {
                setErrorModal({
                    isOpen: true,
                    title: "Purchase Failed",
                    message: data.message || "We could not process your data purchase. Please check your balance and try again."
                });
            }
        } catch (err) {
            console.error("Purchase error:", err);
            setErrorModal({
                isOpen: true,
                title: "System Error",
                message: err.message || "An error occurred while processing your request. Please try again later."
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <LoadingUI message="Loading data plans..." />;

    const dataTransactions = transactions.filter(t => (t.dataPlanId || t.type === 'purchase') && t.status === 'success');

    const filteredPlans = [...plans].sort((a, b) => a.price - b.price);

    const selectedPlan = plans.find((p) => p._id === formData.dataPlanId);

    return (
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 space-y-8">
            {/* Account Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Balance Card */}
                <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl p-6 shadow-lg relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">
                            Balance
                        </p>
                        <div className="flex items-baseline justify-between">
                            <p className="text-3xl font-black">
                                ₦<CountUp end={wallet?.balance || 0} />
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
                </div>

                {/* Data Transactions Card */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                        Success Purchases
                    </p>
                    <p className="text-3xl font-black text-gray-900">
                        <CountUp end={dataTransactions.length} />
                    </p>
                </div>

                {/* Total Spent Card */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                        Total Spent
                    </p>
                    <p className="text-3xl font-black text-blue-600">
                        ₦<CountUp end={wallet?.totalSpent || 0} />
                    </p>
                </div>
            </div>

            {/* Purchase Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">Buy Data Bundle</h2>
                </div>

                <div className="p-8 space-y-10">
                    {/* Quick Number Input */}
                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 shadow-sm animate-fadeIn">
                        <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center">
                            <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] mr-2">1</span>
                            Enter Phone Number
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                {selectedNetwork ? (
                                    <img
                                        src={networkLogos[selectedNetwork.name]}
                                        className="h-6 w-6 object-contain animate-scaleIn"
                                        alt={selectedNetwork.name}
                                    />
                                ) : (
                                    <span className="text-xl opacity-40">📶</span>
                                )}
                            </div>
                            <input
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 11) setFormData((prev) => ({ ...prev, phoneNumber: val }));
                                }}
                                placeholder="e.g. 08123456789"
                                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-black text-lg"
                                maxLength={11}
                                ref={phoneInputRef}
                            />
                            {formData.phoneNumber.length >= 4 && !selectedNetwork && (
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter animate-pulse">Detecting...</span>
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-3 ml-1 font-medium italic">Type your number to auto-detect and highlight the network!</p>
                    </div>
                    {/* Network Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-6">
                            Select Network Provider
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            {networks.map((network) => (
                                <button
                                    key={network._id}
                                    onClick={() => handleSelectNetwork(network)}
                                    className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 group ${selectedNetwork?._id === network._id
                                        ? "border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-50"
                                        : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm"
                                        }`}
                                >
                                    <div className="w-12 h-12 relative mb-3 p-1">
                                        <img
                                            src={networkLogos[network.name] || "/globe.svg"}
                                            alt={network.name}
                                            className="w-full h-full object-contain filter group-hover:drop-shadow-sm transition-all"
                                        />
                                    </div>
                                    <span className={`text-xs font-bold ${selectedNetwork?._id === network._id ? "text-blue-600" : "text-gray-500"
                                        }`}>
                                        {network.name}
                                    </span>

                                    {selectedNetwork?._id === network._id && (
                                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-scaleIn">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Plan Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] mr-2">2</span>
                            Select Data Plan
                        </label>
                        <select
                            value={formData.dataPlanId}
                            onChange={handlePlanChange}
                            disabled={!selectedNetwork}
                            className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400 font-black text-lg h-16"
                        >
                            <option value="">
                                {!selectedNetwork ? "First enter/select a network" : filteredPlans.length === 0 ? "No plans available" : "Choose a data plan"}
                            </option>
                            {filteredPlans.map((plan) => (
                                <option key={plan._id} value={plan._id}>
                                    {plan.name} - ₦{plan.price.toLocaleString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Amount Display */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                    </div>

                    {/* Order Summary (Conditional) */}
                    {selectedPlan && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex justify-between items-center transform transition-all animate-fadeIn">
                            <div>
                                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1">
                                    Order Summary
                                </p>
                                <p className="text-lg font-bold text-blue-900">
                                    {selectedNetwork?.name} {selectedPlan.dataSize}
                                </p>
                                <p className="text-xs text-blue-600 font-medium mt-1">{selectedPlan.validity}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-blue-700">
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
                        {loading ? "Processing Transaction..." : "Buy Now"}
                    </button>
                </div>
            </div>

            {/* Data Transactions Section (Full Width below form) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Recent Data Purchases</h2>
                    <Link href="/dashboard/transactions" className="text-sm font-bold text-blue-600 hover:underline">
                        View All History
                    </Link>
                </div>
                <div className="p-6">
                    {dataTransactions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto text-2xl">
                                📊
                            </div>
                            <p className="text-gray-500 font-medium">No data purchases yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dataTransactions.map((tx) => (
                                <div key={tx._id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-lg">
                                                📶
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">
                                                    {tx.dataPlanId?.dataSize || "Data Bundle"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {tx.phoneNumber} • {new Date(tx.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-900">₦{tx.amount.toLocaleString()}</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tx.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                                                tx.status === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {tx.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <SuccessModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
                title={successModal.title}
                message={successModal.message}
            />

            <ErrorModal
                isOpen={errorModal.isOpen}
                onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
                title={errorModal.title}
                message={errorModal.message}
            />
        </div>
    );
}
