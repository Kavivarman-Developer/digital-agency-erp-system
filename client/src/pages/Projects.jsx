import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/layout/Layout";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  const [form, setForm] = useState({
    name: "",
    clientId: "",
    teamMembers: "",
    deadline: "",
    progress: 0,
    status: "pending"
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const tokenHeader = {
    headers: { Authorization: localStorage.getItem("token") }
  };

  const fetchProjects = async () => {
    const res = await axios.get("http://localhost:5000/api/projects", tokenHeader);
    setProjects(res.data);
  };

  const fetchClients = async () => {
    const res = await axios.get("http://localhost:5000/api/clients", tokenHeader);
    setClients(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ➕ Add / ✏️ Update
  const handleSubmit = async () => {
    if (!form.name) return alert("Project name required");

    const data = {
      ...form,
      teamMembers: form.teamMembers.split(",") // convert to array
    };

    if (editId) {
      await axios.put(
        `http://localhost:5000/api/projects/${editId}`,
        data,
        tokenHeader
      );
    } else {
      await axios.post(
        "http://localhost:5000/api/projects",
        data,
        tokenHeader
      );
    }

    setForm({
      name: "",
      clientId: "",
      teamMembers: "",
      deadline: "",
      progress: 0,
      status: "pending"
    });

    setEditId(null);
    fetchProjects();
  };

  const handleEdit = (p) => {
    setForm({
      ...p,
      teamMembers: p.teamMembers.join(",")
    });
    setEditId(p._id);
  };

  const handleDelete = async (id) => {
    await axios.delete(
      `http://localhost:5000/api/projects/${id}`,
      tokenHeader
    );
    fetchProjects();
  };

  return (
    <Layout>

      {/* 🧾 FORM */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">

        <h2 className="text-xl font-bold mb-4">
          {editId ? "Edit Project" : "Create Project"}
        </h2>

        <div className="grid grid-cols-2 gap-4">

          <input name="name" placeholder="Project Name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded" />

          {/* 🔥 CLIENT DROPDOWN */}
          <select name="clientId"
            value={form.clientId}
            onChange={handleChange}
            className="border p-2 rounded">

            <option value="">Select Client</option>

            {clients.map(c => (
              <option key={c._id} value={c._id}>
                {c.companyName}
              </option>
            ))}

          </select>

          <input name="teamMembers"
            placeholder="Team Members (comma separated)"
            value={form.teamMembers}
            onChange={handleChange}
            className="border p-2 rounded col-span-2" />

          <input type="date" name="deadline"
            value={form.deadline}
            onChange={handleChange}
            className="border p-2 rounded" />

          {/* 🔥 PROGRESS */}
          <input type="number" name="progress"
            value={form.progress}
            onChange={handleChange}
            className="border p-2 rounded"
            min="0" max="100" />

          {/* 🔥 STATUS */}
          <select name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-2 rounded">

            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>

          </select>

        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editId ? "Update" : "Create"}
        </button>

      </div>

      {/* 📊 TABLE */}
      <div className="bg-white p-5 rounded-xl shadow">

        <h2 className="text-xl font-bold mb-4">Projects</h2>

        <table className="w-full">

          <thead>
            <tr className="border-b text-left">
              <th>Name</th>
              <th>Client</th>
              <th>Team</th>
              <th>Deadline</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {projects.map(p => (
              <tr key={p._id} className="border-b hover:bg-gray-50">

                <td>{p.name}</td>
                <td>{p.clientId?.companyName}</td>
                <td>{p.teamMembers.join(", ")}</td>
                <td>{p.deadline?.slice(0,10)}</td>
                <td>{p.progress}%</td>

                <td>
                  <span className={`px-2 py-1 rounded text-sm ${
                    p.status === "completed"
                      ? "bg-green-100 text-green-600"
                      : p.status === "in-progress"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {p.status}
                  </span>
                </td>

                <td className="space-x-2">
                  <button onClick={() => handleEdit(p)} className="text-blue-600">
                    Edit
                  </button>

                  <button onClick={() => handleDelete(p._id)} className="text-red-600">
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </Layout>
  );
}