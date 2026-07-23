// import { useEffect, useState } from "react";
// import axios from "axios";
// import Layout from "../components/layout/Layout";

// export default function Manager() {
//   const [clients, setClients] = useState([]);
//   const [tasks, setTasks] = useState([]);

//   useEffect(() => {
//     fetchClients();
//     fetchMyAssignedTasks();
//   }, []);

//   const fetchClients = async () => {
//     const res = await axios.get("http://localhost:5000/api/clients");

//     setClients(res.data);
//   };

//   const fetchMyAssignedTasks = async () => {
//     const res = await axios.get("http://localhost:5000/api/tasks?assignedBy=my");

//     setTasks(res.data);
//   };

//   return (
//     <Layout>

//       {/* 🔥 Cards */}
//       <div className="grid grid-cols-3 gap-6 mb-6">

//         <div className="bg-white p-5 rounded-xl shadow">
//           <h2 className="text-gray-500">Total Clients</h2>
//           <p className="text-2xl font-bold">{clients.length}</p>
//         </div>

//         <div className="bg-white p-5 rounded-xl shadow">
//           <h2 className="text-gray-500">Active Clients</h2>
//           <p className="text-2xl font-bold text-green-500">
//             {clients.filter(c => c.status === "active").length}
//           </p>
//         </div>

//         <div className="bg-white p-5 rounded-xl shadow">
//           <h2 className="text-gray-500">Projects</h2>
//           <p className="text-2xl font-bold">
//             {clients.reduce((sum, c) => sum + (c.projectCount || 0), 0)}
//           </p>
//         </div>

//       </div>

//       {/* 📋 Tasks assigned by me */}
//       <div className="bg-white p-5 rounded-xl shadow mt-6">
//         <h2 className="text-xl font-bold mb-4">Tasks I Assigned</h2>

//         <table className="w-full">
//           <thead>
//             <tr className="border-b text-left">
//               <th>Title</th>
//               <th>Assignee</th>
//               <th>Deadline</th>
//               <th>Status</th>
//             </tr>
//           </thead>

//           <tbody>
//             {tasks.map((t) => (
//               <tr key={t._id} className="border-b hover:bg-gray-50">
//                 <td>{t.title}</td>
//                 <td>{t.assignedTo?.[0]?.name || t.assignedTo?.[0]?.email}</td>
//                 <td>{t.deadline?.slice(0,10)}</td>
//                 <td>{t.status}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* 📊 Clients Table */}
//       <div className="bg-white p-5 rounded-xl shadow">

//         <h2 className="text-xl font-bold mb-4">Clients Overview</h2>

//         <table className="w-full">

//           <thead>
//             <tr className="border-b text-left">
//               <th>Company</th>
//               <th>Industry</th>
//               <th>Contact</th>
//               <th>Projects</th>
//               <th>Status</th>
//             </tr>
//           </thead>

//           <tbody>
//             {clients.map((c) => (
//               <tr key={c._id} className="border-b hover:bg-gray-50">

//                 <td>{c.companyName}</td>
//                 <td>{c.industry}</td>
//                 <td>{c.contactName}</td>
//                 <td>{c.projectCount}</td>

//                 <td>
//                   <span
//                     className={`px-2 py-1 rounded text-sm ${
//                       c.status === "active"
//                         ? "bg-green-100 text-green-600"
//                         : "bg-red-100 text-red-600"
//                     }`}
//                   >
//                     {c.status}
//                   </span>
//                 </td>

//               </tr>
//             ))}
//           </tbody>

//         </table>

//       </div>

//     </Layout>
//   );
// }



import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/layout/Layout";

export default function Manager() {
  const [clients, setClients] = useState([]);
  const [tasks,   setTasks]   = useState([]);

  useEffect(() => {
    fetchClients();
    fetchMyAssignedTasks();
  }, []);

  const tokenHeader = { headers: { Authorization: localStorage.getItem("token") } };

  const fetchClients = async () => {
    const res = await axios.get("http://localhost:5000/api/clients", tokenHeader);
    setClients(res.data);
  };

  const fetchMyAssignedTasks = async () => {
    const res = await axios.get("http://localhost:5000/api/tasks?assignedBy=my", tokenHeader);
    setTasks(res.data);
  };

  /* ── helpers ── */
  const taskStatusStyle = (s) => ({
    "completed":   { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Completed"   },
    "in-progress": { badge: "bg-amber-100 text-amber-700",    dot: "bg-amber-500",   label: "In Progress" },
    "todo":        { badge: "bg-slate-100 text-slate-500",    dot: "bg-slate-400",   label: "To Do"       },
  }[s] || { badge: "bg-slate-100 text-slate-500", dot: "bg-slate-400", label: "To Do" });

  const industryColor = (ind) => ({
    Technology: "bg-blue-100 text-blue-700",
    Finance:    "bg-emerald-100 text-emerald-700",
    Healthcare: "bg-rose-100 text-rose-700",
    Education:  "bg-yellow-100 text-yellow-700",
    Marketing:  "bg-violet-100 text-violet-700",
    Retail:     "bg-orange-100 text-orange-700",
  }[ind] || "bg-slate-100 text-slate-600");

  const progressColor = (p) => p >= 80 ? "bg-emerald-500" : p >= 40 ? "bg-amber-400" : "bg-blue-500";

  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  /* ── derived stats ── */
  const activeClients    = clients.filter((c) => c.status === "active").length;
  const totalProjects    = clients.reduce((sum, c) => sum + (c.projectCount || 0), 0);
  const completedTasks   = tasks.filter((t) => t.status === "completed").length;
  const inProgressTasks  = tasks.filter((t) => t.status === "in-progress").length;

  return (
    <Layout>

      {/* PAGE HEADER */}
      <div className="mb-6">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Dashboard</p>
        <h1 className="text-2xl font-bold text-slate-800">Manager Overview</h1>
      </div>

      {/* STATS — 2 rows */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Clients",   value: clients.length,  icon: "🏢", bg: "bg-blue-50"    },
          { label: "Active Clients",  value: activeClients,   icon: "✅", bg: "bg-emerald-50"  },
          { label: "Total Projects",  value: totalProjects,   icon: "📁", bg: "bg-violet-50"   },
          { label: "Tasks Assigned",  value: tasks.length,    icon: "📋", bg: "bg-amber-50"    },
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

      {/* TASKS I ASSIGNED */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Tasks I Assigned</h2>
            <p className="text-xs text-slate-400 mt-0.5">{tasks.length} tasks · {completedTasks} completed · {inProgressTasks} in progress</p>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Task", "Assignee", "Deadline", "Progress", "Status"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <span className="text-4xl">📋</span>
                    <p className="text-sm">No tasks assigned yet</p>
                  </div>
                </td>
              </tr>
            ) : tasks.map((t) => {
              const s = taskStatusStyle(t.status);
              const isOverdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== "completed";
              const assignee  = t.assignedTo?.[0];
              return (
                <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">

                  {/* Task */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {t.title?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{t.title}</span>
                    </div>
                  </td>

                  {/* Assignee */}
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
                        {isOverdue && "⚠️ "}{t.deadline.slice(0, 10)}
                      </span>
                    ) : <span className="text-slate-300 text-sm">—</span>}
                  </td>

                  {/* Progress */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5 min-w-[100px]">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${progressColor(t.progress)}`} style={{ width: `${t.progress || 0}%` }} />
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

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CLIENTS OVERVIEW */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Clients Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">{clients.length} clients total</p>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Company", "Industry", "Contact", "Projects", "Status"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <span className="text-4xl">🏢</span>
                    <p className="text-sm">No clients found</p>
                  </div>
                </td>
              </tr>
            ) : clients.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">

                {/* Company */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {c.companyName?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{c.companyName}</span>
                  </div>
                </td>

                {/* Industry */}
                <td className="px-5 py-3.5">
                  {c.industry
                    ? <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${industryColor(c.industry)}`}>{c.industry}</span>
                    : <span className="text-slate-300 text-sm">—</span>}
                </td>

                {/* Contact */}
                <td className="px-5 py-3.5 text-sm text-slate-600">{c.contactName || "—"}</td>

                {/* Projects */}
                <td className="px-5 py-3.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-600">
                    {c.projectCount || 0} projects
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    c.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-600"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${c.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
                    {c.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </Layout>
  );
}