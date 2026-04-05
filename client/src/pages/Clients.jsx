import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/layout/Layout";


export default function Clients() {
  const [clients, setClients] = useState([]);

  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    contactName: "",
    phone: "",
    email: ""
  });

  const [editId, setEditId] = useState(null);


  const fetchClients = async () => {
    const res = await axios.get("http://localhost:5000/api/clients", {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    setClients(res.data);
  };

  // 🧠 Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ➕ Add / ✏️ Update
  const handleSubmit = async () => {
    if (!form.companyName) return alert("Company name required");

    if (editId) {
      await axios.put(
        `http://localhost:5000/api/clients/${editId}`,
        form,
        {
          headers: { Authorization: localStorage.getItem("token") }
        }
      );
    } else {
      await axios.post("http://localhost:5000/api/clients", form, {
        headers: { Authorization: localStorage.getItem("token") }
      });
    }

    setForm({
      companyName: "",
      industry: "",
      contactName: "",
      phone: "",
      email: ""
    });

    setEditId(null);
    fetchClients();
  };

  // ✏️ Edit
  const handleEdit = (client) => {
    setForm(client);
    setEditId(client._id);
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/clients/${id}`, {
      headers: { Authorization: localStorage.getItem("token") }
    });

    fetchClients();
  };

    useEffect(() => {
    fetchClients();
  }, []);

  return (
    <Layout>

      {/* 🧾 FORM */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">

        <h2 className="text-xl font-bold mb-4">
          {editId ? "Edit Client" : "Add Client"}
        </h2>

        <div className="grid grid-cols-2 gap-4">

          <input name="companyName" placeholder="Company Name"
            value={form.companyName}
            onChange={handleChange}
            className="border p-2 rounded" />

          <input name="industry" placeholder="Industry"
            value={form.industry}
            onChange={handleChange}
            className="border p-2 rounded" />

          <input name="contactName" placeholder="Contact Name"
            value={form.contactName}
            onChange={handleChange}
            className="border p-2 rounded" />

          <input name="phone" placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="border p-2 rounded" />

          <input name="email" placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border p-2 rounded col-span-2" />

        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editId ? "Update" : "Add"}
        </button>

      </div>

      {/* 📊 TABLE */}
      <div className="bg-white p-5 rounded-xl shadow">

        <h2 className="text-xl font-bold mb-4">Clients List</h2>

        <table className="w-full">

          <thead>
            <tr className="border-b text-left">
              <th>Company</th>
              <th>Industry</th>
              <th>Contact</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((c) => (
              <tr key={c._id} className="border-b hover:bg-gray-50">

                <td>{c.companyName}</td>
                <td>{c.industry}</td>
                <td>{c.contactName}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>

                <td className="space-x-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(c._id)}
                    className="text-red-600"
                  >
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