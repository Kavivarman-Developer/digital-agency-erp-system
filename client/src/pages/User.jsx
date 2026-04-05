import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../components/layout/Layout";
import { fetchMyTasks, completeTask } from "../features/tasksSlice";
import { fetchLeaves, applyLeave } from "../features/leaveSlice";
import axios from "axios";
import { showToast } from "../utils/toast";

export default function User() {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks.items);
  const status = useSelector((state) => state.tasks.status);
  const leaves = useSelector((state) => state.leave.leaves);

  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    reason: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "idle") dispatch(fetchMyTasks());
  }, [dispatch, status]);

  useEffect(() => {
    dispatch(fetchLeaves());
  }, [dispatch]);

  const handleComplete = (id) => {
    dispatch(completeTask(id));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleApply = async (e) => {
    e.preventDefault();
    
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
    } catch (err) {
      showToast(err.message || "Failed to apply leave", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* MY TASKS SECTION */}
      <h1 className="text-2xl font-bold mb-6">My Tasks</h1>

      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks assigned</p>
      ) : (
        <div className="bg-white p-5 rounded-xl shadow mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th>Task</th>
                <th>Project</th>
                <th>Assigned Date</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((t) => (
                <tr key={t._id} className="border-b">
                  <td>{t.title}</td>
                  <td>{t.projectId?.name}</td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>{t.deadline?.slice(0, 10)}</td>
                  <td>{t.status}</td>
                  <td>
                    {t.status !== "completed" && (
                      <button
                        onClick={() => handleComplete(t._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Mark Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* APPLY LEAVE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEAVE FORM */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-6">Apply for Leave</h2>
          <form onSubmit={handleApply}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                From Date
              </label>
              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                To Date
              </label>
              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Reason
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
                rows="4"
                placeholder="Enter reason for leave..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? "Applying..." : "Apply Leave"}
            </button>
          </form>
        </div>

        {/* YOUR LEAVES */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-6">My Leaves</h2>
          {leaves.length === 0 ? (
            <p className="text-gray-500">No leave applications yet</p>
          ) : (
            <div className="space-y-4">
              {leaves.map((leave) => (
                <div key={leave._id} className="border-l-4 border-blue-500 p-4 bg-gray-50 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 text-sm">{leave.reason}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        leave.status === "approved"
                          ? "bg-green-200 text-green-800"
                          : leave.status === "rejected"
                          ? "bg-red-200 text-red-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Applied on {new Date(leave.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}