import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "../../utils/toast";

export default function CustomerLogin() {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);

  const navigate = useNavigate();

  // Already logged in as customer → shop-க்கு redirect
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");
    if (token && role === "customer") navigate("/", { replace: true });
  }, []);

  const login = async () => {
    if (!email || !password) {
      showToast("All fields required", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });

      // role "customer" இல்லன்னா portal-ல் login பண்ண allow பண்ணாதே
      if (res.data.role !== "customer") {
        showToast("Access denied. Not a customer account.", "error");
        return;
      }

      // Same localStorage keys — existing ProtectedRoute வேலை செய்யும்
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role",  res.data.role);
      localStorage.setItem("email", email);
      localStorage.setItem("customerName", res.data.name || email.split("@")[0]);

      showToast("Welcome to QuickShop! 🛍️");
      navigate("/");
    } catch (err) {
      showToast(err.response?.data || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") login();
  };

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-14 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 -right-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 left-1/4 w-48 h-48 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg">✨</div>
            <span className="text-white font-bold text-lg tracking-tight">QuickShop</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Shop smarter,<br />
            <span className="text-indigo-200">track faster.</span>
          </h1>
          <p className="text-indigo-200 text-sm leading-relaxed mb-10 max-w-sm">
            Sign in to browse products, place orders, and track your deliveries in real-time.
          </p>
          <div className="space-y-3">
            {[
              { icon: "🛍️", label: "Browse Products",  sub: "Explore our full catalogue" },
              { icon: "🛒", label: "Easy Checkout",     sub: "Quick & secure ordering" },
              { icon: "📦", label: "Track Your Orders", sub: "Live status updates" },
              { icon: "💳", label: "Multiple Payments", sub: "UPI, PhonePe & Cash" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3.5">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-base shrink-0">{f.icon}</div>
                <div>
                  <p className="text-white text-sm font-medium leading-none mb-0.5">{f.label}</p>
                  <p className="text-indigo-300 text-xs">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-indigo-300 text-xs">Powered by TeamsInfo CRM platform.</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-sm">✨</div>
            <span className="text-slate-800 font-bold text-base">QuickShop</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
            <p className="text-sm text-slate-400">Sign in to your customer account</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              onClick={login}
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </div>

          <p className="mt-5 text-center text-sm text-slate-400">
            New customer?{" "}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              Create an account
            </Link>
          </p>

          <p className="mt-3 text-center text-xs text-slate-300">
            Admin / Staff?{" "}
            <Link to="/" className="text-slate-400 hover:underline">
              Go to CRM Login
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
