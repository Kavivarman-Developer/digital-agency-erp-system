import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const register = async () => {
    if (!name || !email || !password || !phone) {
      showToast("All fields required", "error");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", { name, email, password, phone, role });
      showToast("Registered successfully");
      navigate("/");
    } catch (err) {
      showToast(err.response?.data || "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  const roleInfo = {
    user:    { icon: "👤", label: "Employee",  desc: "Access tasks & leave requests" },
    manager: { icon: "👔", label: "Manager",   desc: "Manage team, projects & leaves" },
    admin:   { icon: "🛡️", label: "Admin",     desc: "Full system access & control" },
  };

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-14 flex-col justify-between relative overflow-hidden">

        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 -right-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 left-1/4 w-48 h-48 bg-white/5 rounded-full" />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg">⚡</div>
            <span className="text-white font-bold text-lg tracking-tight">WorkSphere</span>
          </div>
        </div>

        {/* Copy */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Join the team,<br />
            <span className="text-blue-200">start collaborating.</span>
          </h1>
          <p className="text-blue-200 text-sm leading-relaxed mb-10 max-w-sm">
            Create your account and get instant access to projects, tasks, clients, and team management.
          </p>

          <div className="space-y-3">
            {[
              { icon: "🔐", label: "Secure Authentication",  sub: "Token-based secure login" },
              { icon: "👥", label: "Multiple Roles",         sub: "User, Manager & Admin access" },
              { icon: "📊", label: "Activity Tracking",      sub: "Full audit trail support" },
              { icon: "⚡", label: "Fast & Easy Access",     sub: "Get started in seconds" },
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

        <p className="relative z-10 text-blue-300 text-xs">Start your journey with our platform.</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white text-sm">⚡</div>
            <span className="text-slate-800 font-bold text-base">TeamsInfo</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Create an account</h2>
            <p className="text-sm text-slate-400">Fill in your details to get started</p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">

            {/* Name */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Full Name</label>
              <input
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Phone */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Phone Number</label>
              <input
                placeholder="+91 99999 99999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>

            {/* Role selector */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(roleInfo).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRole(key)}
                    className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border text-center transition-all ${
                      role === key
                        ? "border-blue-400 bg-blue-50 ring-2 ring-blue-500/20"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-lg">{val.icon}</span>
                    <span className={`text-xs font-medium ${role === key ? "text-blue-700" : "text-slate-600"}`}>
                      {val.label}
                    </span>
                  </button>
                ))}
              </div>
              {/* Role description */}
              <p className="mt-2 text-xs text-slate-400 text-center">{roleInfo[role].desc}</p>
            </div>

            {/* Submit */}
            <button
              onClick={register}
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-blue-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>

          </div>

          {/* Login link */}
          <p className="mt-5 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              className="text-blue-600 cursor-pointer font-medium hover:underline"
            >
              Sign in
            </span>
          </p>

        </div>
      </div>

    </div>
  );
}