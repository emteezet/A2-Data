"use client";

export default function LoadingUI({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="flex flex-col items-center">
        {/* Modern Spinner */}
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full border-[3px] border-blue-50"></div>
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
          <div className="absolute inset-4 rounded-full border-[3px] border-transparent border-b-indigo-500 border-l-indigo-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>

          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
            {message}
          </h2>

          <div className="flex items-center justify-center space-x-1">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
        </div>

        {/* Subtle Progress Track */}
        <div className="w-48 h-1 bg-gray-100 rounded-full mt-10 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 animate-[progress_2s_ease-in-out_infinite]"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
