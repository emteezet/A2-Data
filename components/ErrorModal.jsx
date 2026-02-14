"use client";

import React from "react";

export default function ErrorModal({ isOpen, onClose, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all animate-scaleIn">
                <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <span className="mr-2">⚠️</span> {title || "Error Occurred"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-8">
                    <p className="text-gray-600 font-medium leading-relaxed mb-6">
                        {message || "An unexpected error occurred. Please try again."}
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
