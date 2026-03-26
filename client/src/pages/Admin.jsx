import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/layout/Layout";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import LoginHistory from "../components/dashboards/LoginHistory";

export default function Admin() {
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchLogs();
    fetchTasks();
  }, []);

  const fetchLogs = async () => {
    const res = await axios.get("http://localhost:5000/api/history", {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    setLogs(res.data);
  };

  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:5000/api/tasks", {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    setTasks(res.data);
  };

  const data = [
    { name: "Admin", count: logs.filter(l => l.role === "admin").length },
    { name: "Manager", count: logs.filter(l => l.role === "manager").length },
    { name: "User", count: logs.filter(l => l.role === "user").length }
  ];

  return (
    <Layout>

      {/* 🔥 Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-gray-500">Total Logins</h2>
          <p className="text-2xl font-bold">{logs.length}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-gray-500">Users</h2>
          <p className="text-2xl font-bold">Active</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-gray-500">System</h2>
          <p className="text-2xl font-bold text-green-500">Running</p>
        </div>

      </div>

      {/* <div className="bg-white p-5 rounded-xl shadow mt-6">
        <h2 className="text-xl font-bold mb-4">User Roles Chart</h2>

        <BarChart width={400} height={250} data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </div> */}

      <LoginHistory />
      // 👉 Recent Task Activity
      <div className="bg-white p-5 rounded-xl shadow mt-6">
        <h2 className="text-xl font-bold mb-4">Recent Task Activity</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th>Title</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Completed At</th>
            </tr>
          </thead>

          <tbody>
            {tasks.slice().reverse().slice(0,10).map(t => (
              <tr key={t._id} className="border-b hover:bg-gray-50">
                <td>{t.title}</td>
                <td>{t.assignedTo?.[0]?.name || t.assignedTo?.[0]?.email}</td>
                <td>{t.status}</td>
                <td>{t.completedAt ? t.completedAt.slice(0,10) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </Layout>
  );
}