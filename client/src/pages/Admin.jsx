import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Layout from "../components/layout/Layout";
import LoginHistory from "../components/dashboards/LoginHistory";

export default function Admin() {
  const [logs,  setLogs]  = useState([]);
  const [tasks, setTasks] = useState([]);
  const [view,  setView]  = useState("login");

  useEffect(() => {
    fetchLogs();
    fetchTasks();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/history", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setLogs(res.data);
    } catch {}
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setTasks(res.data);
    } catch {}
  };

  const adminLogins   = logs.filter((l) => l.role === "admin").length;
  const managerLogins = logs.filter((l) => l.role === "manager").length;
  const userLogins    = logs.filter((l) => l.role === "user").length;

  const statusBadge = (status) => {
    const map = {
      completed:     "bg-emerald-100 text-emerald-700",
      "in-progress": "bg-blue-100 text-blue-700",
      pending:       "bg-yellow-100 text-yellow-700",
    };
    return map[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <Layout>

      {/* PAGE HEADER */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Overview</p>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        </div>

        {/* ── Customer Portal Link ── */}
        <Link
          to="/shop"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm shadow-indigo-200"
        >
          <span className="text-base">🛍️</span>
          Customer Portal
          <span className="text-indigo-300 text-xs">↗</span>
        </Link>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Logins", value: logs.length,   icon: "📋", bg: "bg-blue-50",    text: "text-blue-600" },
          { label: "Admin",        value: adminLogins,   icon: "🛡️", bg: "bg-violet-50",  text: "text-violet-600" },
          { label: "Managers",     value: managerLogins, icon: "👔", bg: "bg-orange-50",  text: "text-orange-600" },
          { label: "Users",        value: userLogins,    icon: "👤", bg: "bg-emerald-50", text: "text-emerald-600" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-slate-800">{card.value}</p>
              </div>
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center text-lg`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TAB SWITCHER */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-5">
        {[
          { id: "login", label: "Login History" },
          { id: "tasks", label: "Task Activity" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150
              ${view === tab.id
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LOGIN HISTORY */}
      {view === "login" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <LoginHistory />
        </div>
      )}

      {/* TASK ACTIVITY */}
      {view === "tasks" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Recent Task Activity</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest 10 tasks across all projects</p>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Title", "Assigned To", "Status", "Completed At"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {tasks
                .slice()
                .reverse()
                .slice(0, 10)
                .map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-medium text-slate-700">{t.title}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-500">
                      {t.assignedTo?.[0]?.name || t.assignedTo?.[0]?.email || "—"}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-400">
                      {t.completedAt ? t.completedAt.slice(0, 10) : "—"}
                    </td>
                  </tr>
                ))}

              {tasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400">
                    No tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

    </Layout>
  );
}