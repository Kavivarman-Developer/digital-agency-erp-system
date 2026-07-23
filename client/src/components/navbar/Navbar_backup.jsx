// backup of original Navbar
import { useEffect, useState } from "react";

export default function Navbar() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const email = localStorage.getItem("email") || "kavin@gmail.com";
  const userName = email.split("@")[0];

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  // Listen to external theme updates (like sidebar buttons)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white dark:bg-[#1E293B] shadow p-4 flex justify-between items-center transition-colors border-b dark:border-slate-800">
      <h1 className="font-bold text-lg text-gray-800 dark:text-slate-200">Dashboard</h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full text-sm font-bold capitalize">
            {userName[0]}
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">{userName}</span>
        </div>

        <button
          onClick={() => setDark(!dark)}
          className="p-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm transition-all"
        >
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
    </div>
  );
}
