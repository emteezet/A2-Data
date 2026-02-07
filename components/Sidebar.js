"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth");
  };

  const menuItems = [
    { label: "Account", href: "/dashboard/account", icon: "👤" },
    { label: "Fund Wallet", href: "/dashboard/fund-wallet", icon: "💳" },
    { label: "Buy Data", href: "/dashboard", icon: "📊" },
    { label: "Buy Airtime", href: "/dashboard/airtime", icon: "📱" },
    { label: "Transactions", href: "/dashboard/transactions", icon: "📋" },
    { label: "Wallet Summary", href: "/dashboard/wallet", icon: "💰" },
    { label: "Pricing", href: "/dashboard/pricing", icon: "💹" },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-blue-900 text-white transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } z-40`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-blue-800">
          <h2 className="text-2xl font-bold">DataApp</h2>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
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
