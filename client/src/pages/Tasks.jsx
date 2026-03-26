import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/layout/Layout";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    title: "",
    projectId: "",
    assignedTo: "",
    deadline: "",
    progress: 0,
    status: "todo"
  });

  const [editId, setEditId] = useState(null);
  const [commentMap, setCommentMap] = useState({});

  const tokenHeader = {
    headers: { Authorization: localStorage.getItem("token") }
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, []);

  // 📄 FETCH
  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:5000/api/tasks", tokenHeader);
    setTasks(res.data);
  };

  const fetchProjects = async () => {
    const res = await axios.get("http://localhost:5000/api/projects", tokenHeader);
    setProjects(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:5000/api/users", tokenHeader);
    setUsers(res.data);
  };

  // 🧠 HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ➕ CREATE / ✏️ UPDATE
  const handleSubmit = async () => {
    if (!form.title) return alert("Task title required");

    const data = {
      ...form,
      assignedTo: [form.assignedTo] // ✅ FIXED
    };

    if (editId) {
      await axios.put(
        `http://localhost:5000/api/tasks/${editId}`,
        data,
        tokenHeader
      );
    } else {
      await axios.post(
        "http://localhost:5000/api/tasks",
        data,
        tokenHeader
      );
    }

    setForm({
      title: "",
      projectId: "",
      assignedTo: "",
      deadline: "",
      progress: 0,
      status: "todo"
    });

    setEditId(null);
    fetchTasks();
  };

  // ✏️ EDIT
  const handleEdit = (t) => {
    setForm({
      title: t.title,
      projectId: t.projectId?._id,
      assignedTo: t.assignedTo[0]?._id || "",
      deadline: t.deadline?.slice(0, 10),
      progress: t.progress,
      status: t.status
    });
    setEditId(t._id);
  };

  // ❌ DELETE
  const handleDelete = async (id) => {
    await axios.delete(
      `http://localhost:5000/api/tasks/${id}`,
      tokenHeader
    );
    fetchTasks();
  };

  // 💬 ADD COMMENT
  const addComment = async (taskId) => {
    const text = commentMap[taskId];
    if (!text) return;

    await axios.post(
      `http://localhost:5000/api/tasks/${taskId}/comment`,
      { text },
      tokenHeader
    );

    setCommentMap({ ...commentMap, [taskId]: "" });
    fetchTasks();
  };

  return (
    <Layout>

      {/* 🧾 FORM */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">

        <h2 className="text-xl font-bold mb-4">
          {editId ? "Edit Task" : "Create Task"}
        </h2>

        <div className="grid grid-cols-2 gap-4">

          {/* TITLE */}
          <input
            name="title"
            placeholder="Task Title"
            value={form.title}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          {/* PROJECT */}
          <select
            name="projectId"
            value={form.projectId}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Project</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* 🔥 USER DROPDOWN */}
          <select
            name="assignedTo"
            value={form.assignedTo}
            onChange={(e) =>
              setForm({ ...form, assignedTo: e.target.value })
            }
            className="border p-2 rounded col-span-2"
          >
            <option value="">Select User</option>

            {users.map(u => (
              <option key={u._id} value={u._id}>
                {u.name || u.email}
              </option>
            ))}
          </select>

          {/* DEADLINE */}
          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          {/* PROGRESS */}
          <input
            type="number"
            name="progress"
            value={form.progress}
            onChange={handleChange}
            className="border p-2 rounded"
            min="0"
            max="100"
          />

          {/* STATUS */}
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="todo">To Do</option>
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

        <h2 className="text-xl font-bold mb-4">Tasks</h2>

        <table className="w-full">

          <thead>
            <tr className="border-b text-left">
              <th>Title</th>
              <th>Project</th>
              <th>User</th>
              <th>Deadline</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map(t => (
              <tr key={t._id} className="border-b hover:bg-gray-50">

                <td>{t.title}</td>
                <td>{t.projectId?.name}</td>
                <td>{t.assignedTo?.[0]?.name || t.assignedTo?.[0]?.email}</td>
                <td>{t.deadline?.slice(0, 10)}</td>
                <td>{t.progress}%</td>
                <td>{t.status}</td>

                {/* 💬 COMMENTS */}
                <td>
                  <input
                    placeholder="Comment"
                    value={commentMap[t._id] || ""}
                    onChange={(e) =>
                      setCommentMap({
                        ...commentMap,
                        [t._id]: e.target.value
                      })
                    }
                    className="border p-1 rounded"
                  />

                  <button
                    onClick={() => addComment(t._id)}
                    className="text-blue-600 ml-2"
                  >
                    Add
                  </button>

                  <div className="text-sm mt-1">
                    {t.comments?.map((c, i) => (
                      <p key={i}>💬 {c.text}</p>
                    ))}
                  </div>
                </td>

                {/* ACTIONS */}
                <td className="space-x-2">
                  <button
                    onClick={() => handleEdit(t)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(t._id)}
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