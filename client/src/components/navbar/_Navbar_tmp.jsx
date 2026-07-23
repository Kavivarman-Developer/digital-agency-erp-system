import { useEffect, useState } from "react";
import { Search, Bell, Settings } from "lucide-react";

export default function Navbar() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  const email = localStorage.getItem("email") || "kavin@gmail.com";
  const userName = email.split("@")[0];

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <header className="w-full bg-[var(--crm-bg)] border-b border-slate-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button aria-label="Toggle sidebar" className="p-2 rounded-lg hover:bg-slate-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-slate-600"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>

          <div>
            <h1 className="text-lg font-semibold text-[var(--crm-text)]">CRM</h1>
            <p className="text-xs text-slate-500">Digital Agency</p>
          </div>
        </div>

        <div className="flex-1 max-w-xl">
          <label className="relative block">
            <span className="sr-only">Search</span>
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Search size={16} /></span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-600 shadow-sm focus:border-[var(--crm-secondary)] focus:ring-1 focus:ring-[var(--crm-secondary)]"
              placeholder="Search clients, orders, projects..."
              type="search"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-slate-100">
            <Bell size={18} className="text-slate-600" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--crm-success)] text-white text-[10px] font-semibold flex items-center justify-center">3</span>
          </button>

          <button className="p-2 rounded-lg hover:bg-slate-100">
            <Settings size={18} className="text-slate-600" />
          </button>

          <div className="flex items-center gap-3 pl-2">
            <div className="w-9 h-9 rounded-full bg-[var(--crm-primary)] flex items-center justify-center text-white font-bold">{userName[0]}</div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-[var(--crm-text)] capitalize">{userName}</div>
              <div className="text-xs text-slate-500">Admin</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
