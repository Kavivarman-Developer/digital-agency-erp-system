import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { applyLeave, fetchLeaves } from '../../features/leaveSlice';

const LeaveForm = () => {
    const dispatch = useDispatch();
    const { leaves, loading, error } = useSelector(state => state.leave);

    // ✅ Form state
    const [formData, setFormData] = useState({
        leaveType: "",
        fromDate: "",
        toDate: "",
        reason: "",
        contact: ""
    });
    const [message, setMessage] = useState("");

    // ✅ Fetch leaves on component mount
    useEffect(() => {
        dispatch(fetchLeaves());
    }, [dispatch]);

    // ✅ Handle form input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ✅ Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare data for backend
        const leaveData = {
            fromDate: formData.fromDate,
            toDate: formData.toDate,
            reason: formData.reason
        };

        // Dispatch applyLeave action
        const result = await dispatch(applyLeave(leaveData));
        
        if (result.payload && !result.payload.message?.includes("error")) {
            setMessage("Leave applied successfully!");
            // Reset form
            setFormData({
                leaveType: "",
                fromDate: "",
                toDate: "",
                reason: "",
                contact: ""
            });
            // Refresh leaves list
            dispatch(fetchLeaves());
            setTimeout(() => setMessage(""), 3000);
        } else {
            setMessage(result.payload?.message || "Failed to apply leave");
        }
    };

    return (
        <div>
            <h1 className='text-2xl font-bold mb-6'>Leave Form</h1>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Leave Type */}
                <div>
                    <label className="block font-medium mb-1">Leave Type</label>
                    <select
                        name="leaveType"
                        value={formData.leaveType}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                        required
                    >
                        <option value="">Select Leave Type</option>
                        <option>Casual Leave</option>
                        <option>Sick Leave</option>
                        <option>Earned Leave</option>
                    </select>
                </div>

                {/* Dates */}
                <div className="flex gap-3">
                    <div className="w-full">
                        <label className="block font-medium mb-1">From Date</label>
                        <input
                            type="date"
                            name="fromDate"
                            value={formData.fromDate}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2"
                            required
                        />
                    </div>

                    <div className="w-full">
                        <label className="block font-medium mb-1">To Date</label>
                        <input
                            type="date"
                            name="toDate"
                            value={formData.toDate}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2"
                            required
                        />
                    </div>
                </div>

                {/* Reason */}
                <div>
                    <label className="block font-medium mb-1">Reason</label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-2"
                        rows="3"
                        required
                    ></textarea>
                </div>

                {/* Contact */}
                <div>
                    <label className="block font-medium mb-1">
                        Contact During Leave
                    </label>
                    <input
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-2"
                        placeholder="Phone or Email"
                    />
                </div>

                {/* Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? "Applying..." : "Apply Leave"}
                </button>

                {/* Message */}
                {message && (
                    <p className="text-center text-green-600 mt-2">{message}</p>
                )}
                {error && (
                    <p className="text-center text-red-600 mt-2">{error}</p>
                )}
            </form>

            {/* ✅ Display user's leaves */}
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Your Leaves</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : leaves.length > 0 ? (
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">From Date</th>
                                <th className="border p-2">To Date</th>
                                <th className="border p-2">Reason</th>
                                <th className="border p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map(leave => (
                                <tr key={leave._id}>
                                    <td className="border p-2">{new Date(leave.fromDate).toLocaleDateString()}</td>
                                    <td className="border p-2">{new Date(leave.toDate).toLocaleDateString()}</td>
                                    <td className="border p-2">{leave.reason}</td>
                                    <td className="border p-2">
                                        <span className={`px-2 py-1 rounded ${
                                            leave.status === 'approved' ? 'bg-green-200' :
                                            leave.status === 'rejected' ? 'bg-red-200' :
                                            'bg-yellow-200'
                                        }`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No leaves found</p>
                )}
            </div>
        </div >
    )
}

export default LeaveForm;

