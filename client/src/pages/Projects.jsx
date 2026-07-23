import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/layout/Layout";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    name: "", clientId: "", teamMembers: "", deadline: "", progress: 0, status: "pending"
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);

  const tokenHeader = { headers: { Authorization: localStorage.getItem("token") } };

  const fetchProjects = async () => {
    const res = await axios.get("http://localhost:5000/api/projects", tokenHeader);
    setProjects(res.data);
  };

  const fetchClients = async () => {
    const res = await axios.get("http://localhost:5000/api/clients", tokenHeader);
    setClients(res.data);
  };

  useEffect(() => { fetchProjects(); fetchClients(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name) return;
    setLoading(true);
    try {
      const data = { ...form, teamMembers: form.teamMembers.split(",").map(s => s.trim()).filter(Boolean) };
      if (editId) {
        await axios.put(`http://localhost:5000/api/projects/${editId}`, data, tokenHeader);
      } else {
        await axios.post("http://localhost:5000/api/projects", data, tokenHeader);
      }
      setForm({ name: "", clientId: "", teamMembers: "", deadline: "", progress: 0, status: "pending" });
      setEditId(null);
      setShowForm(false);
      fetchProjects();
    } finally { setLoading(false); }
  };

  const handleEdit = (p) => {
    setForm({ ...p, teamMembers: p.teamMembers.join(", ") });
    setEditId(p._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/projects/${id}`, tokenHeader);
    setDeleteId(null);
    fetchProjects();
  };

  const handleCancel = () => {
    setForm({ name: "", clientId: "", teamMembers: "", deadline: "", progress: 0, status: "pending" });
    setEditId(null);
    setShowForm(false);
  };

  const statusStyle = (status) => {
    const map = {
      "completed":   { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Completed" },
      "in-progress": { badge: "bg-amber-100 text-amber-700",    dot: "bg-amber-500",   label: "In Progress" },
      "pending":     { badge: "bg-slate-100 text-slate-500",    dot: "bg-slate-400",   label: "Pending" },
    };
    return map[status] || map["pending"];
  };

  const progressColor = (p) => {
    if (p >= 80) return "bg-emerald-500";
    if (p >= 40) return "bg-amber-400";
    return "bg-blue-500";
  };

  const totalCompleted = projects.filter(p => p.status === "completed").length;
  const totalInProgress = projects.filter(p => p.status === "in-progress").length;
  const avgProgress = projects.length
    ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
    : 0;

  return (
    <Layout>

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Management</p>
          <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", clientId: "", teamMembers: "", deadline: "", progress: 0, status: "pending" }); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
        >
          <span className="text-lg leading-none">+</span>
          New Project
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Projects",  value: projects.length,  icon: "📁", bg: "bg-blue-50" },
          { label: "Completed",       value: totalCompleted,   icon: "✅", bg: "bg-emerald-50" },
          { label: "In Progress",     value: totalInProgress,  icon: "⚡", bg: "bg-amber-50" },
          { label: "Avg Progress",    value: `${avgProgress}%`, icon: "📊", bg: "bg-violet-50" },
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

      {/* SLIDE-IN FORM */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">{editId ? "Edit Project" : "New Project"}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{editId ? "Update project details" : "Fill in the details to create a new project"}</p>
            </div>
            <button onClick={handleCancel} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors text-lg">✕</button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">

              {/* Project Name */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Project Name *</label>
                <input
                  name="name"
                  placeholder="e.g. Website Redesign"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                />
              </div>

              {/* Client Dropdown */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Client</label>
                <select
                  name="clientId"
                  value={form.clientId}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                >
                  <option value="">Select Client</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              {/* Team Members */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Team Members <span className="text-slate-300">(comma separated)</span></label>
                <input
                  name="teamMembers"
                  placeholder="e.g. Alice, Bob, Charlie"
                  value={form.teamMembers}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Progress */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Progress — <span className="text-blue-600 font-semibold">{form.progress}%</span>
                </label>
                <input
                  type="range"
                  name="progress"
                  min="0" max="100"
                  value={form.progress}
                  onChange={handleChange}
                  className="w-full accent-blue-600"
                />
              </div>

            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading || !form.name}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Saving..." : editId ? "Update Project" : "Create Project"}
              </button>
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 text-sm font-medium text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">All Projects</h2>
          <p className="text-xs text-slate-400 mt-0.5">{projects.length} projects total</p>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Project", "Client", "Team", "Deadline", "Progress", "Status", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <span className="text-4xl">📁</span>
                    <p className="text-sm">No projects yet. Create your first project!</p>
                  </div>
                </td>
              </tr>
            ) : (
              projects.map((p) => {
                const s = statusStyle(p.status);
                const members = Array.isArray(p.teamMembers) ? p.teamMembers : [];
                const isOverdue = p.deadline && new Date(p.deadline) < new Date() && p.status !== "completed";

                return (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">

                    {/* Project Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {p.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{p.name}</span>
                      </div>
                    </td>

                    {/* Client */}
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {p.clientId?.companyName || <span className="text-slate-300">—</span>}
                    </td>

                    {/* Team Members as avatars */}
                    <td className="px-5 py-3.5">
                      {members.length === 0 ? (
                        <span className="text-slate-300 text-sm">—</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          {members.slice(0, 3).map((m, i) => (
                            <div
                              key={i}
                              title={m}
                              className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white -ml-1 first:ml-0"
                            >
                              {m.trim()[0]?.toUpperCase()}
                            </div>
                          ))}
                          {members.length > 3 && (
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-semibold border-2 border-white -ml-1">
                              +{members.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Deadline */}
                    <td className="px-5 py-3.5">
                      {p.deadline ? (
                        <span className={`text-sm ${isOverdue ? "text-red-500 font-medium" : "text-slate-500"}`}>
                          {isOverdue && <span className="mr-1">⚠️</span>}
                          {p.deadline.slice(0, 10)}
                        </span>
                      ) : <span className="text-slate-300 text-sm">—</span>}
                    </td>

                    {/* Progress bar */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5 min-w-[100px]">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${progressColor(p.progress)}`}
                            style={{ width: `${p.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 font-medium w-8 text-right">{p.progress || 0}%</span>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(p._id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* DELETE CONFIRM MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-slate-100">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">🗑️</div>
            <h3 className="text-base font-semibold text-slate-800 text-center mb-2">Delete Project?</h3>
            <p className="text-sm text-slate-400 text-center mb-6">This action cannot be undone. The project will be permanently removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 text-sm font-medium text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}