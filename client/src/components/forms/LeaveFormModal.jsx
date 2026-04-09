import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { applyLeave, fetchLeaves } from '../../features/leaveSlice';

const LeaveFormModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector(state => state.leave);

    // ✅ Form state - Matches backend schema exactly
    const [formData, setFormData] = useState({
        fromDate: "",
        toDate: "",
        reason: ""
    });
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // 'success' or 'error'

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
        
        if (result.payload?.leave) {
            setMessageType("success");
            setMessage("✅ Leave applied successfully!");
            
            // Reset form
            setFormData({
                fromDate: "",
                toDate: "",
                reason: ""
            });
            
            // Refresh leaves list
            dispatch(fetchLeaves());
            
            // Close modal after 2 seconds
            setTimeout(() => {
                onClose();
                setMessage("");
            }, 2000);
        } else {
            setMessageType("error");
            setMessage(result.payload?.message || "❌ Failed to apply leave");
        }
    };

    // ✅ Handle modal close
    const handleClose = () => {
        setFormData({
            fromDate: "",
            toDate: "",
            reason: ""
        });
        setMessage("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            {/* ✅ Modal Container */}
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-screen overflow-y-auto">
                
                {/* ✅ Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Apply Leave</h2>
                    <button
                        onClick={handleClose}
                        className="text-2xl hover:bg-blue-800 rounded-full w-8 h-8 flex items-center justify-center transition"
                    >
                        ✕
                    </button>
                </div>

                {/* ✅ Modal Body */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* From Date */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-2">📅 From Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="fromDate"
                                value={formData.fromDate}
                                onChange={handleChange}
                                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                                required
                            />
                        </div>

                        {/* To Date ..*/}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-2">📅 To Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="toDate"
                                value={formData.toDate}
                                onChange={handleChange}
                                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                                required
                            />
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-2">📝 Reason <span className="text-red-500">*</span></label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                                rows="4"
                                placeholder="Enter the reason for your leave request..."
                                required
                            ></textarea>
                        </div>

                        {/* Note about Status */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                            <p className="text-sm text-blue-700">
                                <span className="font-semibold">📌 Note:</span> Your leave request will be submitted with a <span className="font-semibold">pending</span> status and awaits manager/admin approval.
                            </p>
                        </div>

                        {/* Message */}
                        {message && (
                            <div className={`p-3 rounded-lg text-center font-semibold ${
                                messageType === 'success' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                {message}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                            >
                                {loading ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LeaveFormModal;
