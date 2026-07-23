import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../components/layout/Layout";
import { fetchAllLeaves, approveLeave } from "../features/leaveSlice";
import { showToast } from "../utils/toast";

export default function Leaves() {
  const dispatch = useDispatch();
  const allLeaves = useSelector((state) => state.leave.allLeaves);
  const userRole = localStorage.getItem("role");
  const [actioningId, setActioningId] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    dispatch(fetchAllLeaves());
  }, [dispatch]);

  const isAuthorized = userRole === "manager" || userRole === "admin";

  if (!isAuthorized) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-3xl mb-4">🔒</div>
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Access Denied</h2>
          <p className="text-sm text-slate-400">Only managers and admins can access this page.</p>
        </div>
      </Layout>
    );
  }

  const handleApprove = async (leaveId) => {
    setActioningId(leaveId);
    try {
      await dispatch(approveLeave({ id: leaveId, status: "approved" })).unwrap();
      showToast("Leave approved successfully", "success");
    } catch (err) {
      showToast(err.message || "Failed to approve leave", "error");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (leaveId) => {
    setActioningId(leaveId);
    try {
      await dispatch(approveLeave({ id: leaveId, status: "rejected" })).unwrap();
      showToast("Leave rejected", "success");
    } catch (err) {
      showToast(err.message || "Failed to reject leave", "error");
    } finally {
      setActioningId(null);
    }
  };

  const pendingLeaves  = allLeaves.filter((l) => l.status === "pending");
  const approvedLeaves = allLeaves.filter((l) => l.status === "approved");
  const rejectedLeaves = allLeaves.filter((l) => l.status === "rejected");

  const tabData = {
    pending:  { leaves: pendingLeaves,  label: "Pending",  dot: "bg-amber-400",   badge: "bg-amber-100 text-amber-700" },
    approved: { leaves: approvedLeaves, label: "Approved", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
    rejected: { leaves: rejectedLeaves, label: "Rejected", dot: "bg-red-500",     badge: "bg-red-100 text-red-600" },
  };

  const activeleaves = tabData[activeTab].leaves;

  const getDuration = (from, to) => {
    const diff = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;
    return `${diff} day${diff !== 1 ? "s" : ""}`;
  };

  const fmt = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Layout>

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Management</p>
          <h1 className="text-2xl font-bold text-slate-800">Leave Requests</h1>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Requests", value: allLeaves.length,      icon: "📅", bg: "bg-blue-50" },
          { label: "Pending",        value: pendingLeaves.length,  icon: "⏳", bg: "bg-amber-50" },
          { label: "Approved",       value: approvedLeaves.length, icon: "✅", bg: "bg-emerald-50" },
          { label: "Rejected",       value: rejectedLeaves.length, icon: "❌", bg: "bg-red-50" },
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

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* TABS inside card header */}
        <div className="px-6 pt-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex gap-1">
            {Object.entries(tabData).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-medium transition-colors ${
                  activeTab === key
                    ? "bg-slate-100 text-slate-800"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${val.dot}`} />
                {val.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${val.badge}`}>
                  {val.leaves.length}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 pb-2">{activeleaves.length} requests</p>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Employee", "Duration", "Dates", "Reason", "Applied On",
                ...(activeTab === "pending" ? ["Actions"] : [])
              ].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {activeleaves.length === 0 ? (
              <tr>
                <td colSpan={activeTab === "pending" ? 6 : 5} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <span className="text-4xl">
                      {activeTab === "pending" ? "⏳" : activeTab === "approved" ? "✅" : "❌"}
                    </span>
                    <p className="text-sm">No {activeTab} leave requests</p>
                  </div>
                </td>
              </tr>
            ) : (
              activeleaves.map((leave) => (
                <tr key={leave._id} className="hover:bg-slate-50/80 transition-colors">

                  {/* Employee */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {leave.employeeId?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{leave.employeeId?.name}</p>
                        <p className="text-xs text-slate-400">{leave.employeeId?.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Duration badge */}
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                      {getDuration(leave.fromDate, leave.toDate)}
                    </span>
                  </td>

                  {/* From → To */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <span>{fmt(leave.fromDate)}</span>
                      <span className="text-slate-300">→</span>
                      <span>{fmt(leave.toDate)}</span>
                    </div>
                  </td>

                  {/* Reason */}
                  <td className="px-5 py-3.5 text-sm text-slate-500 max-w-[200px]">
                    <p className="truncate" title={leave.reason}>{leave.reason || "—"}</p>
                  </td>

                  {/* Applied On */}
                  <td className="px-5 py-3.5 text-sm text-slate-400">{fmt(leave.createdAt)}</td>

                  {/* Actions — only for pending tab */}
                  {activeTab === "pending" && (
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(leave._id)}
                          disabled={actioningId === leave._id}
                          className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {actioningId === leave._id ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(leave._id)}
                          disabled={actioningId === leave._id}
                          className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {actioningId === leave._id ? "..." : "Reject"}
                        </button>
                      </div>
                    </td>
                  )}

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </Layout>
  );
}