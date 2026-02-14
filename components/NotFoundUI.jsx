"use client";

import Link from "next/link";

export default function NotFoundUI({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  homeHref = "/",
  backHref = null,
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Illustration */}
        <div className="relative mb-12 flex justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
          <div className="relative">
            <h1 className="text-[180px] font-black leading-none bg-gradient-to-b from-blue-600 to-indigo-800 bg-clip-text text-transparent opacity-20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl animate-bounce">🔍</span>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4 mb-10 relative z-10">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
            {message}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          {backHref && (
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm"
            >
              Go Back
            </button>
          )}
          <Link
            href={homeHref}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-md"
          >
            Return Home
          </Link>
        </div>

        {/* Helpful Resources */}
        <div className="pt-10 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Helpful Links
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600 font-bold transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/pricing"
              className="text-gray-600 hover:text-blue-600 font-bold transition-colors"
            >
              Pricing
            </Link>
            <a
              href="mailto:support@a2data.com"
              className="text-gray-600 hover:text-blue-600 font-bold transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
