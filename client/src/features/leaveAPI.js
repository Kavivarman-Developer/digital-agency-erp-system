import axios from "axios";

const API = "http://localhost:5000/api/leaves";

// Apply leave
export const applyLeaveAPI = async (data) => {
  const res = await axios.post(`${API}/apply`, data);
  return res.data.leave || res.data;
};

// Get my leaves
export const getLeavesAPI = async () => {
  const res = await axios.get(`${API}/my-leaves`);
  return res.data.leaves || res.data;
};

// Get all leaves (for managers/admins)
export const getAllLeavesAPI = async () => {
  const res = await axios.get(`${API}`);
  return res.data.allLeaves || res.data;
};

// Approve/Reject leave
export const approveLeaveAPI = async (id, status) => {
  const res = await axios.put(`${API}/update-status`, { leaveId: id, status });
  return res.data; 
};