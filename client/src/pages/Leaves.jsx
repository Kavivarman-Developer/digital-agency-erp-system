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

  useEffect(() => {
    dispatch(fetchAllLeaves());
  }, [dispatch]);

  // Check if user is manager or admin
  const isAuthorized = userRole === "manager" || userRole === "admin";

  if (!isAuthorized) {
    return (
      <Layout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Access Denied</p>
          <p>Only managers and admins can access this page.</p>
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

  const pendingLeaves = allLeaves.filter((leave) => leave.status === "pending");
  const approvedLeaves = allLeaves.filter((leave) => leave.status === "approved");
  const rejectedLeaves = allLeaves.filter((leave) => leave.status === "rejected");

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leave Requests</h1>
        <p className="text-gray-600">
          Total: {allLeaves.length} | Pending: {pendingLeaves.length} | Approved: {approvedLeaves.length} | Rejected: {rejectedLeaves.length}
        </p>
      </div>

      {/* PENDING LEAVES */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-yellow-700">Pending Approvals ({pendingLeaves.length})</h2>
        {pendingLeaves.length === 0 ? (
          <p className="text-gray-500">No pending leave requests</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-yellow-50">
                <tr className="border-b">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Employee</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">From Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">To Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Reason</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Applied On</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map((leave) => (
                  <tr key={leave._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{leave.employeeId?.name}</p>
                        <p className="text-sm text-gray-500">{leave.employeeId?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(leave.fromDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(leave.toDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{leave.reason}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleApprove(leave._id)}
                          disabled={actioningId === leave._id}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 text-sm font-semibold"
                        >
                          {actioningId === leave._id ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(leave._id)}
                          disabled={actioningId === leave._id}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 text-sm font-semibold"
                        >
                          {actioningId === leave._id ? "..." : "Reject"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* APPROVED LEAVES */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-green-700">Approved ({approvedLeaves.length})</h2>
        {approvedLeaves.length === 0 ? (
          <p className="text-gray-500">No approved leaves</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-green-50">
                <tr className="border-b">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Employee</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">From Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">To Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Reason</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Approved On</th>
                </tr>
              </thead>
              <tbody>
                {approvedLeaves.map((leave) => (
                  <tr key={leave._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{leave.employeeId?.name}</p>
                        <p className="text-sm text-gray-500">{leave.employeeId?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(leave.fromDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(leave.toDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{leave.reason}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REJECTED LEAVES */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-red-700">Rejected ({rejectedLeaves.length})</h2>
        {rejectedLeaves.length === 0 ? (
          <p className="text-gray-500">No rejected leaves</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-red-50">
                <tr className="border-b">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Employee</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">From Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">To Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Reason</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Rejected On</th>
                </tr>
              </thead>
              <tbody>
                {rejectedLeaves.map((leave) => (
                  <tr key={leave._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{leave.employeeId?.name}</p>
                        <p className="text-sm text-gray-500">{leave.employeeId?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(leave.fromDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(leave.toDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{leave.reason}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}