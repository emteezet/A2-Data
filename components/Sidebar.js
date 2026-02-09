"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar({ isOpen: externalIsOpen, setIsOpen: externalSetIsOpen }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const router = useRouter();

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen !== undefined ? externalSetIsOpen : setInternalIsOpen;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth");
  };

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: "🏠" },
    { label: "Fund Wallet", href: "/dashboard/fund-wallet", icon: "💳" },
    { label: "Buy Data", href: "/dashboard/buy-data", icon: "📊" },
    { label: "Buy Airtime", href: "/dashboard/airtime", icon: "📱" },
    { label: "Transactions", href: "/dashboard/transactions", icon: "📋" },
    { label: "Wallet Summary", href: "/dashboard/wallet", icon: "💰" },
    { label: "Pricing", href: "/dashboard/pricing", icon: "💹" },
    { label: "Account", href: "/dashboard/account", icon: "👤" },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-blue-900 text-white transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } z-40 shadow-2xl flex flex-col`}
      >
        {/* Logo & Close Button */}
        <div className="p-6 border-b border-blue-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold">A2 Data</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-white hover:text-blue-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-800 transition"
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition bg-red-700 font-semibold"
          >
            <span className="text-xl">🚪</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        ></div>
      )}
    </>
  );
}
