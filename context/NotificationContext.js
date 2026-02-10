"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = "success") => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed top-6 left-0 right-0 z-[100000] flex flex-col items-center space-y-3 pointer-events-none">
                {notifications.map((n) => (
                    <div key={n.id} className="pointer-events-auto">
                        <Toast
                            message={String(n.message)}
                            type={n.type}
                            onClose={() => removeNotification(n.id)}
                        />
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

const Toast = ({ message, type, onClose }) => {
    const config = {
        success: { bg: "bg-emerald-600", icon: "✅" },
        error: { bg: "bg-rose-600", icon: "❌" },
        info: { bg: "bg-sky-600", icon: "ℹ️" },
        warning: { bg: "bg-amber-500", icon: "⚠️" },
    }[type] || { bg: "bg-gray-700", icon: "🔔" };

    return (
        <div
            className={`${config.bg} text-white px-5 py-3.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center space-x-4 animate-slideInTop border border-white/20 backdrop-blur-sm min-w-[300px] max-w-[90vw]`}
        >
            <span className="text-xl flex-shrink-0">{config.icon}</span>
            <p className="font-bold text-sm leading-tight flex-1">{message}</p>
            <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                aria-label="Close notification"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};
