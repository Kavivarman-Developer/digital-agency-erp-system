import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../components/layout/Layout";
import { fetchMyTasks, completeTask } from "../features/tasksSlice";
import { fetchLeaves, applyLeave } from "../features/leaveSlice";
import { showToast } from "../utils/toast";

export default function User() {
  const dispatch = useDispatch();
  const tasks  = useSelector((state) => state.tasks.items);
  const status = useSelector((state) => state.tasks.status);
  const leaves = useSelector((state) => state.leave.leaves);

  const [formData, setFormData]     = useState({ fromDate: "", toDate: "", reason: "" });
  const [loading, setLoading]       = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showLeaves, setShowLeaves]       = useState(false);

  useEffect(() => {
    if (status === "idle") dispatch(fetchMyTasks());
  }, [dispatch, status]);

  useEffect(() => {
    dispatch(fetchLeaves());
  }, [dispatch]);

  const handleComplete = async (id) => {
    setCompletingId(id);
    await dispatch(completeTask(id));
    setCompletingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Plain async function — no form, no e.preventDefault needed
  const handleApply = async () => {
    if (!formData.fromDate || !formData.toDate || !formData.reason) {
      showToast("All fields are required", "error");
      return;
    }
    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      showToast("From date must be before to date", "error");
      return;
    }
    setLoading(true);
    try {
      await dispatch(applyLeave({ data: formData })).unwrap();
      showToast("Leave applied successfully", "success");
      setFormData({ fromDate: "", toDate: "", reason: "" });
      setShowLeaveForm(false);
      dispatch(fetchLeaves());
    } catch (err) {
      showToast(err.message || "Failed to apply leave", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ── helpers ── */
  const taskStatusStyle = (s) => ({
    "completed":   { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Completed"   },
    "in-progress": { badge: "bg-amber-100 text-amber-700",    dot: "bg-amber-500",   label: "In Progress" },
    "todo":        { badge: "bg-slate-100 text-slate-500",    dot: "bg-slate-400",   label: "To Do"       },
  }[s] || { badge: "bg-slate-100 text-slate-500", dot: "bg-slate-400", label: "To Do" });

  const leaveStatusStyle = (s) => ({
    approved: { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", bar: "bg-emerald-500", label: "Approved" },
    rejected: { badge: "bg-red-100 text-red-600",         dot: "bg-red-500",     bar: "bg-red-400",    label: "Rejected" },
    pending:  { badge: "bg-amber-100 text-amber-700",     dot: "bg-amber-400",   bar: "bg-amber-400",  label: "Pending"  },
  }[s] || { badge: "bg-amber-100 text-amber-700", dot: "bg-amber-400", bar: "bg-amber-400", label: "Pending" });

  const progressColor = (p) => p >= 80 ? "bg-emerald-500" : p >= 40 ? "bg-amber-400" : "bg-blue-500";

  const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const getDuration = (from, to) => {
    const diff = Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1;
    return `${diff} day${diff !== 1 ? "s" : ""}`;
  };

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks   = tasks.filter((t) => t.status !== "completed").length;
  const pendingLeaves  = leaves.filter((l) => l.status === "pending").length;
  const approvedLeaves = leaves.filter((l) => l.status === "approved").length;

  const durationValid =
    formData.fromDate && formData.toDate &&
    new Date(formData.fromDate) <= new Date(formData.toDate);

  return (
    <Layout>

      {/* PAGE HEADER */}
      <div className="mb-6">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Dashboard</p>
        <h1 className="text-2xl font-bold text-slate-800">My Workspace</h1>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Tasks",     value: tasks.length,   icon: "📋", bg: "bg-blue-50" },
          { label: "Pending Tasks",   value: pendingTasks,   icon: "⏳", bg: "bg-amber-50" },
          { label: "Completed Tasks", value: completedTasks, icon: "✅", bg: "bg-emerald-50" },
          { label: "Leave Requests",  value: leaves.length,  icon: "📅", bg: "bg-violet-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-slate-800">{s.value}</p>
            </div>
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-lg`}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* MY TASKS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">My Tasks</h2>
          <p className="text-xs text-slate-400 mt-0.5">{tasks.length} tasks assigned to you</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Task","Project","Assigned On","Deadline","Progress","Status","Action"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <span className="text-4xl">📋</span>
                    <p className="text-sm">No tasks assigned yet</p>
                  </div>
                </td>
              </tr>
            ) : tasks.map((t) => {
              const s = taskStatusStyle(t.status);
              const isOverdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== "completed";
              return (
                <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {t.title?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{t.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {t.projectId?.name
                      ? <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">{t.projectId.name}</span>
                      : <span className="text-slate-300 text-sm">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">{fmt(t.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    {t.deadline
                      ? <span className={`text-sm ${isOverdue ? "text-red-500 font-medium" : "text-slate-500"}`}>{isOverdue && "⚠️ "}{t.deadline.slice(0,10)}</span>
                      : <span className="text-slate-300 text-sm">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5 min-w-[90px]">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${progressColor(t.progress)}`} style={{ width: `${t.progress||0}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 font-medium w-8 text-right">{t.progress||0}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {t.status !== "completed" ? (
                      <button
                        type="button"
                        onClick={() => handleComplete(t._id)}
                        disabled={completingId === t._id}
                        className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {completingId === t._id ? "..." : "Mark Complete"}
                      </button>
                    ) : <span className="text-xs text-slate-300">Done</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── LEAVE SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── APPLY LEAVE: toggle panel ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Header — click to open/close */}
          <button
            type="button"
            onClick={() => setShowLeaveForm((v) => !v)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
          >
            <div className="text-left">
              <h2 className="text-base font-semibold text-slate-800">Apply for Leave</h2>
              <p className="text-xs text-slate-400 mt-0.5">Submit a new leave request</p>
            </div>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${showLeaveForm ? "bg-blue-600 text-white rotate-45" : "bg-blue-50 text-blue-600"}`}>
              <span className="text-lg leading-none font-light">+</span>
            </div>
          </button>

          {/* Collapsible form body */}
          {showLeaveForm && (
            <div className="border-t border-slate-100 p-6">

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">From Date</label>
                  <input
                    type="date"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">To Date</label>
                  <input
                    type="date"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {durationValid && (
                <div className="mb-4 px-3 py-2 bg-blue-50 rounded-xl flex items-center gap-2">
                  <span className="text-blue-500 text-sm">📅</span>
                  <span className="text-xs text-blue-600 font-medium">
                    {getDuration(formData.fromDate, formData.toDate)} leave requested
                  </span>
                </div>
              )}

              <div className="mb-5">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter reason for leave..."
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                {/* ✅ type="button" onClick — no form wrapping */}
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-200"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Submitting...
                    </span>
                  ) : "Apply Leave"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowLeaveForm(false); setFormData({ fromDate:"", toDate:"", reason:"" }); }}
                  className="px-5 py-2.5 text-sm font-medium text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>

            </div>
          )}
        </div>

        {/* ── MY LEAVES: toggle panel ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Header — click to open/close */}
          <button
            type="button"
            onClick={() => setShowLeaves((v) => !v)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
          >
            <div className="text-left">
              <h2 className="text-base font-semibold text-slate-800">My Leaves</h2>
              <p className="text-xs text-slate-400 mt-0.5">{leaves.length} total requests</p>
            </div>
            <div className="flex items-center gap-2">
              {pendingLeaves > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  {pendingLeaves} pending
                </span>
              )}
              {approvedLeaves > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  {approvedLeaves} approved
                </span>
              )}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${showLeaves ? "bg-slate-200 text-slate-600" : "bg-slate-100 text-slate-400"}`}>
                <span className="text-sm">{showLeaves ? "▲" : "▼"}</span>
              </div>
            </div>
          </button>

          {/* Collapsible list */}
          {showLeaves && (
            <div className="border-t border-slate-100">
              {leaves.length === 0 ? (
                <div className="flex flex-col items-center gap-2 text-slate-400 py-10">
                  <span className="text-4xl">📅</span>
                  <p className="text-sm">No leave applications yet</p>
                </div>
              ) : (
                <div className="p-4 max-h-[400px] overflow-y-auto space-y-3">
                  {leaves.map((leave) => {
                    const s = leaveStatusStyle(leave.status);
                    return (
                      <div key={leave._id} className="rounded-xl border border-slate-100 overflow-hidden hover:shadow-sm transition-shadow">
                        {/* status color bar */}
                        <div className={`h-1 w-full ${s.bar}`} />
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-slate-700">{fmt(leave.fromDate)}</span>
                              <span className="text-slate-300 text-xs">→</span>
                              <span className="text-sm font-medium text-slate-700">{fmt(leave.toDate)}</span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                                {getDuration(leave.fromDate, leave.toDate)}
                              </span>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ml-2 ${s.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                              {s.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mb-2 line-clamp-2">{leave.reason}</p>
                          <p className="text-xs text-slate-300">Applied on {fmt(leave.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}