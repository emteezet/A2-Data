"use client";

import { useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
    name: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const action = isLogin ? "login" : "register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
          };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "An error occurred");
        return;
      }

      // Save token
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data));

      // Redirect
      window.location.href = "/dashboard";
    } catch (err) {
      if (err.name === "AbortError") {
        setError(
          "Request timeout. Please check your internet connection and try again.",
        );
      } else {
        setError("Network error. Please try again.");
      }
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">DataApp</h1>
        <p className="text-gray-600 mb-8">Nigeria&apos;s Fastest Data Platform</p>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              isLogin ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              !isLogin ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                required
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Loading..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          <a href="#" className="text-blue-600 hover:underline">
            Forgot password?
          </a>
        </p>
      </div>
    </div>
  );
}
