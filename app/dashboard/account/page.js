"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/context/NotificationContext";
import LoadingUI from "@/components/LoadingUI";


import SuccessModal from "@/components/SuccessModal";
import ErrorModal from "@/components/ErrorModal";

export default function AccountPage() {
  const { showNotification } = useNotification();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: "", message: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      window.location.href = "/auth";
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData({
      name: parsedUser.name || "",
      email: parsedUser.email || "",
      phone: parsedUser.phone || parsedUser.phoneNumber || "",
    });
  }, []);

  // Auto-close modals after 3 seconds
  useEffect(() => {
    let timer;
    if (successModal.isOpen || errorModal.isOpen) {
      timer = setTimeout(() => {
        setSuccessModal(prev => ({ ...prev, isOpen: false }));
        setErrorModal(prev => ({ ...prev, isOpen: false }));
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [successModal.isOpen, errorModal.isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          phoneNumber: formData.phone // Map 'phone' from state to 'phoneNumber' for API
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.data));
        setUser(data.data);
        setIsEditing(false);
        setSuccessModal({
          isOpen: true,
          title: "Success",
          message: "Your profile has been updated successfully!"
        });
      } else {
        setErrorModal({
          isOpen: true,
          title: "Update Failed",
          message: data.message || "Failed to update profile. Please try again."
        });
      }
    } catch (err) {
      setErrorModal({
        isOpen: true,
        title: "System Error",
        message: "An error occurred while updating your profile."
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <LoadingUI message="Fetching account details..." />;

  // Improved date rendering with fallback
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Profile Information</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg font-bold transition-all text-sm shadow-md active:scale-95 ${isEditing
              ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              : "bg-white text-blue-600 hover:bg-blue-50"
              }`}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div className="p-8">
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 11) setFormData(prev => ({ ...prev, phone: val }));
                    }}
                    placeholder="08123456789"
                    maxLength={11}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Role
                  </label>
                  <input
                    type="text"
                    value={user.role || "Customer"}
                    disabled
                    className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl font-medium text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2"
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{loading ? "Processing Update..." : "Save Changes"}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="border-b border-gray-50 pb-4">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Full Name</p>
                <p className="font-bold text-gray-900 text-lg">{user.name}</p>
              </div>
              <div className="border-b border-gray-50 pb-4">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Email Address</p>
                <p className="font-bold text-gray-900 text-lg">{user.email}</p>
              </div>
              <div className="border-b border-gray-50 pb-4">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Phone Number</p>
                <p className="font-bold text-gray-900 text-lg">{user.phone || user.phoneNumber || "Not set"}</p>
              </div>
              <div className="border-b border-gray-50 pb-4">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Account Rank</p>
                <div className="flex items-center">
                  <span className="font-bold text-gray-900 text-lg capitalize">{user.role || "Customer"}</span>
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black uppercase rounded tracking-tighter">Verified</span>
                </div>
              </div>
              <div className="border-b border-gray-50 pb-4 md:col-span-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Member Since</p>
                <p className="font-bold text-gray-900 text-lg">{formatDate(user.createdAt)}</p>
              </div>
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
