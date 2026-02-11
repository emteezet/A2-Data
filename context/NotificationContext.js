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
        console.log(`Showing notification: [${type}] ${msgString}`);
        const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        setNotifications((prev) => {
            // Prevent duplicate active messages of the same type
            if (prev.some((n) => n.message === msgString && n.type === type)) return prev;
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
            <div className="fixed top-24 right-6 z-[999999] flex flex-col items-end space-y-4 pointer-events-none max-w-[calc(100vw-3rem)]">
                {notifications.map((n) => (
                    <div key={n.id} className="pointer-events-auto w-full flex justify-end">
                        <Toast
                            message={n.message}
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
        success: { accent: "border-emerald-500", icon: "CheckCircleIcon", color: "text-emerald-500", bg: "bg-emerald-50" },
        error: { accent: "border-rose-500", icon: "XCircleIcon", color: "text-rose-500", bg: "bg-rose-50" },
        info: { accent: "border-blue-500", icon: "InformationCircleIcon", color: "text-blue-500", bg: "bg-blue-50" },
        warning: { accent: "border-amber-500", icon: "ExclamationTriangleIcon", color: "text-amber-500", bg: "bg-amber-50" },
    }[type] || { accent: "border-slate-500", icon: "BellIcon", color: "text-slate-500", bg: "bg-slate-50" };

    const icons = {
        CheckCircleIcon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${config.color}`}><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>,
        XCircleIcon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${config.color}`}><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" /></svg>,
        InformationCircleIcon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${config.color}`}><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>,
        ExclamationTriangleIcon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${config.color}`}><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.401 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>,
        BellIcon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${config.color}`}><path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" /></svg>,
    };

    return (
        <div
            className={`bg-white border-l-4 ${config.accent} text-gray-900 px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 animate-slideInRight min-w-[300px] max-w-[400px] pointer-events-auto border border-gray-100`}
        >
            <div className={`p-2 rounded-full ${config.bg}`}>
                {icons[config.icon]}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight text-gray-900 truncate">{type.toUpperCase()}</p>
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};
