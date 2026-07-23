import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   const role = localStorage.getItem("role");
  //   if (!token) return;
  //   if (role === "admin") navigate("/admin", { replace: true });
  //   else if (role === "manager") navigate("/manager", { replace: true });
  //   else navigate("/user", { replace: true });
  // }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) return;

    switch (role) {
      case "admin":
        navigate("/admin", { replace: true });
        break;

      case "manager":
        navigate("/manager", { replace: true });
        break;

      case "customer":
        navigate("/shop", { replace: true });
        break;

      case "user":
        navigate("/user", { replace: true });
        break;

      default:
        break;
    }
  }, [navigate]);

  const login = async () => {
    if (!email || !password) {
      showToast("All fields required", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("email", email);
      showToast("Login successful");
      if (res.data.role === "admin") navigate("/admin");
      else if (res.data.role === "manager") navigate("/manager");
      else if (res.data.role === "customer") navigate("/shop");
      else navigate("/user");
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
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-14 flex-col justify-between relative overflow-hidden">

        {/* Background decoration circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 -right-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 left-1/4 w-48 h-48 bg-white/5 rounded-full" />

        {/* Logo / Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg">⚡</div>
            <span className="text-white font-bold text-lg tracking-tight">TeamsInfo</span>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage your team,<br />
            <span className="text-blue-200">effortlessly.</span>
          </h1>
          <p className="text-blue-200 text-sm leading-relaxed mb-10 max-w-sm">
            A unified workspace for projects, tasks, clients, and leave management — all in one place.
          </p>

          <div className="space-y-3">
            {[
              { icon: "🔐", label: "JWT Authentication", sub: "Secure token-based sessions" },
              { icon: "👥", label: "Role-Based Access", sub: "Admin, Manager & Employee views" },
              { icon: "📊", label: "Login Tracking", sub: "Full audit trail support" },
              { icon: "⚡", label: "Fast & Responsive", sub: "Built on MERN stack" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3.5">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-base shrink-0">{f.icon}</div>
                <div>
                  <p className="text-white text-sm font-medium leading-none mb-0.5">{f.label}</p>
                  <p className="text-blue-300 text-xs">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="relative z-10 text-blue-300 text-xs">Built for real-world application & assessment.</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white text-sm">⚡</div>
            <span className="text-slate-800 font-bold text-base">WorkSphere</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
            <p className="text-sm text-slate-400">Sign in to your account to continue</p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">

            {/* Email */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
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

            {/* Submit */}
            <button
              onClick={login}
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-blue-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>

          </div>

          {/* Register link */}
          <p className="mt-5 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-600 cursor-pointer font-medium hover:underline"
            >
              Create one
            </span>
          </p>

        </div>
      </div>

    </div>
  );
}