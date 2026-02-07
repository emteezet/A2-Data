"use client";

import Link from "next/link";

export default function ErrorUI({
  title = "Oops! Something went wrong",
  message = "An unexpected error occurred. Please try again later.",
  statusCode = null,
  actionText = "Go Back",
  actionHref = "/",
  onRetry = null,
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <div className="max-w-md w-full mx-auto text-center px-6">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
        </div>

        {/* Status Code */}
        {statusCode && (
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-red-600 text-white rounded-full font-bold text-lg">
              Error {statusCode}
            </span>
          </div>
        )}

        {/* Error Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>

        {/* Error Message */}
        <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          )}
          <Link
            href={actionHref}
            className={`flex-1 px-6 py-3 ${
              onRetry
                ? "bg-gray-300 hover:bg-gray-400"
                : "bg-red-600 hover:bg-red-700"
            } text-${onRetry ? "gray" : "white"}-900 font-semibold rounded-lg transition-colors duration-200`}
          >
            {actionText}
          </Link>
        </div>

        {/* Additional Help Text */}
        <div className="mt-8 pt-6 border-t border-red-200">
          <p className="text-sm text-gray-600">
            If this problem persists, please{" "}
            <a
              href="mailto:support@dataapp.com"
              className="text-red-600 font-semibold hover:underline"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
