"use client";

import Link from "next/link";

export default function NotFoundUI({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist.",
  homeHref = "/",
  backHref = null,
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="max-w-md w-full mx-auto text-center px-6">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-purple-600 drop-shadow-lg">
            404
          </h1>
        </div>

        {/* Not Found Icon */}
        <div className="mb-6">
          <span className="text-6xl">🔍</span>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>

        {/* Message */}
        <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>

        {/* Illustration/Description */}
        <div className="bg-white rounded-lg p-6 mb-8 border-2 border-purple-200">
          <p className="text-gray-700">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            It seems you&apos;ve wandered off the path. The page you&apos;re
            looking for has been removed or doesn&apos;t exist.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Go Back
            </Link>
          )}
          <Link
            href={homeHref}
            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Go Home
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 pt-6 border-t border-purple-200">
          <p className="text-sm text-gray-600 mb-4">Need help?</p>
          <div className="flex justify-center gap-4">
            <a
              href="/pricing"
              className="text-purple-600 hover:underline text-sm font-semibold"
            >
              Pricing
            </a>
            <a
              href="mailto:support@dataapp.com"
              className="text-purple-600 hover:underline text-sm font-semibold"
            >
              Support
            </a>
            <a
              href="/dashboard"
              className="text-purple-600 hover:underline text-sm font-semibold"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
