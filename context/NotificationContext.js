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
        const msgString = String(message);
        const id = `${Date.now()}-${Math.random()}`;

        setNotifications((prev) => {
            // Prevent duplicate active messages
            if (prev.some((n) => String(n.message) === msgString)) return prev;
            return [...prev, { id, message: msgString, type }];
        });

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
            <div className="fixed top-6 right-6 z-[100000] flex flex-col items-end space-y-3 pointer-events-none">
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
        success: { accent: "border-emerald-500", icon: "✅" },
        error: { accent: "border-rose-500", icon: "❌" },
        info: { accent: "border-sky-500", icon: "ℹ️" },
        warning: { accent: "border-amber-500", icon: "⚠️" },
    }[type] || { accent: "border-slate-500", icon: "🔔" };

    return (
        <div
            className={`bg-slate-900 border-l-4 ${config.accent} text-white px-5 py-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center space-x-4 animate-slideInRight min-w-[320px] max-w-[400px] pointer-events-auto`}
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
