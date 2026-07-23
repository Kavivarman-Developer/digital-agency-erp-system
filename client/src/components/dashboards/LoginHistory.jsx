import { useEffect, useState } from "react";
import axios from "axios";

export default function LoginHistory() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const pageSizes = [5, 10, 25, 50];

  useEffect(() => { fetchLogs(); }, []);
  useEffect(() => { filterLogs(); }, [search, date, logs]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/history", {
        headers: { Authorization: localStorage.getItem("token") }
      });
      setLogs(res.data);
      setFilteredLogs(res.data);
    } catch {}
  };

  const filterLogs = () => {
    let temp = [...logs];
    if (search) temp = temp.filter(l => l.email.toLowerCase().includes(search.toLowerCase()));
    if (date) temp = temp.filter(l => new Date(l.loginTime).toISOString().slice(0, 10) === date);
    setFilteredLogs(temp);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const roleBadge = (role) => {
    const map = {
      admin:   "bg-violet-100 text-violet-700 border border-violet-200",
      manager: "bg-blue-100 text-blue-700 border border-blue-200",
      user:    "bg-emerald-100 text-emerald-700 border border-emerald-200",
    };
    return map[role] || "bg-gray-100 text-gray-600";
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Login History</h2>
          <p className="text-xs text-slate-400 mt-0.5">{filteredLogs.length} records found</p>
        </div>

        {/* ROWS PER PAGE */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Rows per page</span>
          <select
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            {pageSizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            placeholder="Search by email..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <input
            type="date"
            className="pl-4 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all text-slate-600"
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        {(search || date) && (
          <button
            onClick={() => { setSearch(""); setDate(""); }}
            className="px-4 py-2 text-xs font-medium text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Login Time</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">📭</span>
                    <span>No login records found</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((log, i) => {
                const loginDate = new Date(log.loginTime);
                return (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {startIndex + i + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {log.email?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-700 font-medium">{log.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge(log.role)}`}>
                        {log.role?.charAt(0).toUpperCase() + log.role?.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {loginDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">
                      {loginDate.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate-400">
            Showing <span className="font-medium text-slate-600">{startIndex + 1}</span> – <span className="font-medium text-slate-600">{Math.min(startIndex + itemsPerPage, filteredLogs.length)}</span> of <span className="font-medium text-slate-600">{filteredLogs.length}</span>
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>

            {pages.map((p, idx) => (
              <span key={idx}>
                {idx > 0 && pages[idx - 1] !== p - 1 && (
                  <span className="px-1 text-slate-300 text-xs">...</span>
                )}
                <button
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors
                    ${currentPage === p
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 border border-slate-200"
                    }`}
                >
                  {p}
                </button>
              </span>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}