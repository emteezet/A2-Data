"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";
import LoadingUI from "@/components/LoadingUI";
import SuccessModal from "@/components/SuccessModal";
import ErrorModal from "@/components/ErrorModal";
import CountUp from "@/components/CountUp";

const networkLogos = {
  "MTN": "/mtn-logo.svg",
  "Airtel": "/airtel-logo.svg",
  "Glo": "/glo-logo.svg",
  "9mobile": "/9mobile-logo.svg"
};


export default function AirtimePage() {
  const { showNotification } = useNotification();
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [networks, setNetworks] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [amounts, setAmounts] = useState([]);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [step, setStep] = useState("select-network");
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: "", message: "" });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });

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
        body: JSON.stringify({ action: "history", limit: 10, type: "airtime_purchase" }),
      });
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

      const data = await res.json();
      if (data.success) {
        setNetworks(data.data);
      }
    } catch (err) {
      console.error("Error fetching networks:", err.message);
    }
  };

  const handleSelectNetwork = (network) => {
    setSelectedNetwork(network);
    const airtimeAmounts = [100, 200, 500, 1000, 2000, 5000];
    setAmounts(airtimeAmounts);
    setStep("details");
  };

  const handleAmountSelect = (amt) => {
    setSelectedAmount(amt);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      setCustomAmount(val);
      setSelectedAmount(null);
    }
  };

  const finalAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);

  // Network detection and validation
  useEffect(() => {
    if (phoneNumber.length >= 4) {
      const detected = detectNetwork(phoneNumber);
      if (detected) {
        // Find the network object that matches the detected name
        const networkObj = networks.find(n => n.name.toLowerCase() === detected.toLowerCase());
        if (networkObj && (!selectedNetwork || selectedNetwork.name !== detected)) {
          setSelectedNetwork(networkObj);
          if (step === "select-network") {
            const airtimeAmounts = [100, 200, 500, 1000, 2000, 5000];
            setAmounts(airtimeAmounts);
            setStep("details");
          }
        }
      } else {
        setSelectedNetwork(null);
      }
    } else {
      setSelectedNetwork(null);
      if (phoneNumber.length === 0) setStep("select-network");
    }
  }, [phoneNumber, networks]);

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
    if (!phoneNumber || !finalAmount) {
      showNotification("Please fill all fields", "warning");
      return;
    }

    if (!validatePhone(phoneNumber)) {
      showNotification("Invalid Nigerian phone number format", "error");
      return;
    }

    if (finalAmount < 50) {
      showNotification("Minimum airtime amount is ₦50", "warning");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    const idempotencyKey = `AIRTIME-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

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
          amount: finalAmount,
          phoneNumber: normalizeForApi(phoneNumber),
          idempotencyKey,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("select-network");
        setPhoneNumber("");
        setSelectedAmount(null);
        setCustomAmount("");
        setSelectedNetwork(null);
        fetchWallet(token);
        fetchTransactions(token);
        setSuccessModal({
          isOpen: true,
          title: "Purchase Successful",
          message: `You have successfully purchased ₦${finalAmount.toLocaleString()} airtime for ${normalizeForApi(phoneNumber)}.`
        });
      } else {
        setErrorModal({
          isOpen: true,
          title: "Purchase Failed",
          message: data.message || "We could not process your airtime purchase. Please check your balance and try again."
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

  if (!user) return <LoadingUI message="Setting up Secure payment gateway..." />;

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

        {/* Airtime Transactions Card */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
            Success Purchases
          </p>
          <p className="text-3xl font-black text-gray-900">
            <CountUp end={transactions.filter(t => t.status === 'success' || t.status === 'successful').length} />
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

      {/* Purchase Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Buy Airtime</h2>
        </div>

        <div className="p-8">
          {step === "select-network" ? (
            <div className="space-y-8">
              {/* Quick Number Input */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm animate-fadeIn">
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
                      <span className="text-xl opacity-40 text-gray-400">📶</span>
                    )}
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 11) setPhoneNumber(val);
                    }}
                    placeholder="e.g. 08031234567"
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-lg placeholder:font-bold placeholder:text-gray-300"
                    maxLength={11}
                  />
                  {phoneNumber.length >= 4 && !selectedNetwork && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter animate-pulse">Detecting...</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-3 ml-1 font-medium italic">Type your number and we'll auto-detect the network!</p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Or Select Manually</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {networks.map((network) => (
                  <button
                    key={network._id}
                    onClick={() => handleSelectNetwork(network)}
                    className="p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-600 hover:bg-blue-50/50 hover:shadow-md transition-all duration-300 flex flex-col items-center group relative overflow-hidden"
                  >
                    <div className="w-12 h-12 relative mb-3 p-1 bg-white rounded-xl shadow-sm border border-gray-50 group-hover:shadow-md transition-all">
                      <img
                        src={networkLogos[network.name] || "/globe.svg"}
                        alt={network.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                      {network.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <button
                onClick={() => {
                  setStep("select-network");
                  setSelectedNetwork(null);
                  setSelectedAmount(null);
                  setCustomAmount("");
                }}
                className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Change Network
              </button>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 p-1 bg-white rounded-lg shadow-sm">
                  <img src={networkLogos[selectedNetwork?.name]} alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Network</p>
                  <p className="font-bold text-gray-900">{selectedNetwork?.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Select Amount
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {amounts.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => handleAmountSelect(amt)}
                        className={`py-3 px-2 border-2 rounded-xl transition-all font-bold text-sm ${selectedAmount === amt
                          ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm"
                          : "border-gray-100 hover:border-blue-200 text-gray-600"
                          }`}
                      >
                        ₦{amt}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold">₦</span>
                    </div>
                    <input
                      type="text"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Enter custom amount"
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 11) setPhoneNumber(val);
                    }}
                    placeholder="08123456789"
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-lg placeholder:font-bold placeholder:text-gray-300"
                    maxLength={11}
                  />
                  <p className="text-[10px] text-gray-400 mt-2 ml-1 italic">* Double check the number before proceeding</p>
                </div>
              </div>

              {finalAmount > 0 && (
                <div className={`border rounded-xl p-6 flex justify-between items-center transform animate-fadeIn ${wallet?.balance < finalAmount ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"}`}>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${wallet?.balance < finalAmount ? "text-red-500" : "text-blue-500"}`}>Payment Summary</p>
                    <p className={`text-lg font-bold ${wallet?.balance < finalAmount ? "text-red-900" : "text-blue-900"}`}>{selectedNetwork?.name} Airtime</p>
                    <p className={`text-xs font-medium ${wallet?.balance < finalAmount ? "text-red-600" : "text-blue-600"}`}>
                      {wallet?.balance < finalAmount ? "Insufficient Wallet Balance" : `Recipient: ${phoneNumber || "..."}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-black ${wallet?.balance < finalAmount ? "text-red-700" : "text-blue-700"}`}>₦{finalAmount.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handlePurchase}
                disabled={loading || !phoneNumber || finalAmount < 50 || (wallet && wallet.balance < finalAmount)}
                className={`w-full text-white py-4 rounded-xl font-bold text-lg active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:scale-100 disabled:shadow-none ${wallet?.balance < finalAmount ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {loading ? "Securely Processing..." :
                  wallet?.balance < finalAmount ? "Insufficient Balance" :
                    `Buy ₦${finalAmount.toLocaleString()} Airtime`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Airtime Purchases Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Airtime Purchases</h2>
          <Link href="/dashboard/transactions" className="text-sm font-bold text-blue-600 hover:underline">
            View All History
          </Link>
        </div>
        <div className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto text-2xl">
                📱
              </div>
              <p className="text-gray-500 font-medium">No airtime purchases yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transactions.map((tx) => (
                <div key={tx._id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-lg">
                        📱
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {tx.network || tx.networkId?.name || "Airtime"} Purchase
                        </p>
                        <p className="text-xs text-gray-500">
                          {tx.phoneNumber} • {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">₦{tx.amount.toLocaleString()}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tx.status === 'success' || tx.status === 'successful' ? 'bg-emerald-100 text-emerald-700' :
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
