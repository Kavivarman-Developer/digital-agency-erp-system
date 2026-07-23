import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/layout/Layout";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "", projectId: "", assignedTo: "", deadline: "", progress: 0, status: "todo"
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commentMap, setCommentMap] = useState({});
  const [expandedTask, setExpandedTask] = useState(null);

  const tokenHeader = { headers: { Authorization: localStorage.getItem("token") } };

  const fetchTasks = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/tasks`, tokenHeader);
    setTasks(res.data);
  };
  const fetchProjects = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/projects`, tokenHeader);
    setProjects(res.data);
  };
  const fetchUsers = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`, tokenHeader);
    setUsers(res.data);
  };

  useEffect(() => { fetchTasks(); fetchProjects(); fetchUsers(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.title) return;
    setLoading(true);
    try {
      const data = { ...form, assignedTo: [form.assignedTo] };
      if (editId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/tasks/${editId}`, data, tokenHeader);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/tasks`, data, tokenHeader);
      }
      setForm({ title: "", projectId: "", assignedTo: "", deadline: "", progress: 0, status: "todo" });
      setEditId(null);
      setShowForm(false);
      fetchTasks();
    } finally { setLoading(false); }
  };

  const handleEdit = (t) => {
    setForm({
      title: t.title,
      projectId: t.projectId?._id || "",
      assignedTo: t.assignedTo?.[0]?._id || "",
      deadline: t.deadline?.slice(0, 10) || "",
      progress: t.progress || 0,
      status: t.status
    });
    setEditId(t._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${id}`, tokenHeader);
    setDeleteId(null);
    fetchTasks();
  };

  const handleCancel = () => {
    setForm({ title: "", projectId: "", assignedTo: "", deadline: "", progress: 0, status: "todo" });
    setEditId(null);
    setShowForm(false);
  };

  const addComment = async (taskId) => {
    const text = commentMap[taskId];
    if (!text?.trim()) return;
    await axios.post(`${import.meta.env.VITE_API_URL}/tasks/${taskId}/comment`, { text }, tokenHeader);
    setCommentMap({ ...commentMap, [taskId]: "" });
    fetchTasks();
  };

  const statusStyle = (status) => {
    const map = {
      "completed":   { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Completed" },
      "in-progress": { badge: "bg-amber-100 text-amber-700",    dot: "bg-amber-500",   label: "In Progress" },
      "todo":        { badge: "bg-slate-100 text-slate-500",    dot: "bg-slate-400",   label: "To Do" },
    };
    return map[status] || map["todo"];
  };

  const progressColor = (p) => {
    if (p >= 80) return "bg-emerald-500";
    if (p >= 40) return "bg-amber-400";
    return "bg-blue-500";
  };

  const totalCompleted = tasks.filter(t => t.status === "completed").length;
  const totalInProgress = tasks.filter(t => t.status === "in-progress").length;
  const totalTodo = tasks.filter(t => t.status === "todo").length;

  return (
    <Layout>

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Management</p>
          <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ title: "", projectId: "", assignedTo: "", deadline: "", progress: 0, status: "todo" }); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
        >
          <span className="text-lg leading-none">+</span>
          New Task
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Tasks",  value: tasks.length,    icon: "📋", bg: "bg-blue-50" },
          { label: "To Do",        value: totalTodo,       icon: "🔲", bg: "bg-slate-50" },
          { label: "In Progress",  value: totalInProgress, icon: "⚡", bg: "bg-amber-50" },
          { label: "Completed",    value: totalCompleted,  icon: "✅", bg: "bg-emerald-50" },
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
              <h2 className="text-base font-semibold text-slate-800">{editId ? "Edit Task" : "New Task"}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{editId ? "Update task details" : "Fill in the details to create a new task"}</p>
            </div>
            <button onClick={handleCancel} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors text-lg">✕</button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Task Title *</label>
                <input
                  name="title"
                  placeholder="e.g. Design landing page"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Project</label>
                <select
                  name="projectId"
                  value={form.projectId}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                >
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Assign To</label>
                <select
                  name="assignedTo"
                  value={form.assignedTo}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                >
                  <option value="">Select User</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name || u.email}</option>)}
                </select>
              </div>

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

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

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
                disabled={loading || !form.title}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Saving..." : editId ? "Update Task" : "Create Task"}
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
          <h2 className="text-base font-semibold text-slate-800">All Tasks</h2>
          <p className="text-xs text-slate-400 mt-0.5">{tasks.length} tasks total</p>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Task", "Project", "Assigned To", "Deadline", "Progress", "Status", "Comments", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <span className="text-4xl">📋</span>
                    <p className="text-sm">No tasks yet. Create your first task!</p>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((t) => {
                const s = statusStyle(t.status);
                const isOverdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== "completed";
                const assignee = t.assignedTo?.[0];
                const commentCount = t.comments?.length || 0;
                const isExpanded = expandedTask === t._id;

                return (
                  <>
                    <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">

                      {/* Task title */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {t.title?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{t.title}</span>
                        </div>
                      </td>

                      {/* Project */}
                      <td className="px-5 py-3.5">
                        {t.projectId?.name ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                            {t.projectId.name}
                          </span>
                        ) : <span className="text-slate-300 text-sm">—</span>}
                      </td>

                      {/* Assigned To */}
                      <td className="px-5 py-3.5">
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                              {(assignee.name || assignee.email)?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm text-slate-600">{assignee.name || assignee.email}</span>
                          </div>
                        ) : <span className="text-slate-300 text-sm">—</span>}
                      </td>

                      {/* Deadline */}
                      <td className="px-5 py-3.5">
                        {t.deadline ? (
                          <span className={`text-sm ${isOverdue ? "text-red-500 font-medium" : "text-slate-500"}`}>
                            {isOverdue && <span className="mr-1">⚠️</span>}
                            {t.deadline.slice(0, 10)}
                          </span>
                        ) : <span className="text-slate-300 text-sm">—</span>}
                      </td>

                      {/* Progress */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5 min-w-[100px]">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${progressColor(t.progress)}`}
                              style={{ width: `${t.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 font-medium w-8 text-right">{t.progress || 0}%</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                      </td>

                      {/* Comments toggle */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setExpandedTask(isExpanded ? null : t._id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          💬 {commentCount}
                          <span className="text-slate-400">{isExpanded ? "▲" : "▼"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(t)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(t._id)}
                            className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>

                    </tr>

                    {/* EXPANDABLE COMMENTS ROW */}
                    {isExpanded && (
                      <tr key={`${t._id}-comments`} className="bg-slate-50/60">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="max-w-2xl">

                            {/* Existing comments */}
                            {t.comments?.length > 0 && (
                              <div className="space-y-2 mb-3">
                                {t.comments.map((c, i) => (
                                  <div key={i} className="flex items-start gap-2.5">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-0.5">
                                      {c.author?.[0]?.toUpperCase() || "?"}
                                    </div>
                                    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 text-sm text-slate-600 flex-1">
                                      {c.text}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add comment input */}
                            <div className="flex items-center gap-2">
                              <input
                                placeholder="Write a comment..."
                                value={commentMap[t._id] || ""}
                                onChange={(e) => setCommentMap({ ...commentMap, [t._id]: e.target.value })}
                                onKeyDown={(e) => e.key === "Enter" && addComment(t._id)}
                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                              />
                              <button
                                onClick={() => addComment(t._id)}
                                className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                              >
                                Post
                              </button>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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
            <h3 className="text-base font-semibold text-slate-800 text-center mb-2">Delete Task?</h3>
            <p className="text-sm text-slate-400 text-center mb-6">This action cannot be undone. The task will be permanently removed.</p>
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