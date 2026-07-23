import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/layout/Layout";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ companyName: "", industry: "", contactName: "", phone: "", email: "" });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchClients = async () => {
    const res = await axios.get("http://localhost:5000/api/clients", {
      headers: { Authorization: localStorage.getItem("token") }
    });
    setClients(res.data);
  };

  useEffect(() => { fetchClients(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.companyName) return;
    setLoading(true);
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/clients/${editId}`, form, {
          headers: { Authorization: localStorage.getItem("token") }
        });
      } else {
        await axios.post("http://localhost:5000/api/clients", form, {
          headers: { Authorization: localStorage.getItem("token") }
        });
      }
      setForm({ companyName: "", industry: "", contactName: "", phone: "", email: "" });
      setEditId(null);
      setShowForm(false);
      fetchClients();
    } finally { setLoading(false); }
  };

  const handleEdit = (client) => {
    setForm(client);
    setEditId(client._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/clients/${id}`, {
      headers: { Authorization: localStorage.getItem("token") }
    });
    setDeleteId(null);
    fetchClients();
  };

  const handleCancel = () => {
    setForm({ companyName: "", industry: "", contactName: "", phone: "", email: "" });
    setEditId(null);
    setShowForm(false);
  };

  const industryColor = (ind) => {
    const map = {
      Technology: "bg-blue-100 text-blue-700",
      Finance: "bg-emerald-100 text-emerald-700",
      Healthcare: "bg-rose-100 text-rose-700",
      Education: "bg-yellow-100 text-yellow-700",
      Marketing: "bg-violet-100 text-violet-700",
      Retail: "bg-orange-100 text-orange-700",
    };
    return map[ind] || "bg-slate-100 text-slate-600";
  };

  return (
    <Layout>

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Management</p>
          <h1 className="text-2xl font-bold text-slate-800">Clients</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ companyName: "", industry: "", contactName: "", phone: "", email: "" }); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
        >
          <span className="text-lg leading-none">+</span>
          Add Client
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Clients", value: clients.length, icon: "🏢", bg: "bg-blue-50" },
          { label: "Industries", value: [...new Set(clients.map(c => c.industry).filter(Boolean))].length, icon: "🏭", bg: "bg-violet-50" },
          { label: "Active", value: clients.length, icon: "✅", bg: "bg-emerald-50" },
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
              <h2 className="text-base font-semibold text-slate-800">{editId ? "Edit Client" : "New Client"}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{editId ? "Update client details" : "Fill in the details to add a new client"}</p>
            </div>
            <button onClick={handleCancel} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors text-lg">✕</button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { name: "companyName", placeholder: "Company Name", label: "Company Name *" },
                { name: "industry",   placeholder: "e.g. Technology", label: "Industry" },
                { name: "contactName", placeholder: "Contact Person", label: "Contact Name" },
                { name: "phone",      placeholder: "+91 99999 99999", label: "Phone" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">{field.label}</label>
                  <input
                    name={field.name}
                    placeholder={field.placeholder}
                    value={form[field.name]}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email Address</label>
                <input
                  name="email"
                  placeholder="client@company.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading || !form.companyName}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Saving..." : editId ? "Update Client" : "Add Client"}
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
          <h2 className="text-base font-semibold text-slate-800">All Clients</h2>
          <p className="text-xs text-slate-400 mt-0.5">{clients.length} clients total</p>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Company", "Industry", "Contact", "Phone", "Email", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <span className="text-4xl">🏢</span>
                    <p className="text-sm">No clients yet. Add your first client!</p>
                  </div>
                </td>
              </tr>
            ) : (
              clients.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.companyName?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{c.companyName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {c.industry ? (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${industryColor(c.industry)}`}>{c.industry}</span>
                    ) : <span className="text-slate-300 text-sm">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{c.contactName || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{c.phone || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{c.email || "—"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(c)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(c._id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DELETE CONFIRM MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-slate-100">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">🗑️</div>
            <h3 className="text-base font-semibold text-slate-800 text-center mb-2">Delete Client?</h3>
            <p className="text-sm text-slate-400 text-center mb-6">This action cannot be undone. The client will be permanently removed.</p>
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