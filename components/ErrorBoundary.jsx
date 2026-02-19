"use client";

import React from "react";
import Link from "next/link";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can log the error to an error reporting service here
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100 text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-gray-500 mb-8">
                            We encountered an unexpected error. Please try refreshing the page or head back to the dashboard.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
                            >
                                Refresh Page
                            </button>
                            <Link
                                href="/dashboard"
                                className="block w-full text-blue-600 font-bold hover:underline"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                        {process.env.NODE_ENV !== "production" && (
                            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-h-40">
                                <p className="text-xs font-mono text-red-600 whitespace-pre-wrap">
                                    {this.state.error?.toString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
