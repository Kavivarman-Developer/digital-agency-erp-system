const leaves = require('../models/leaveModel');


const applyLeave = async (req, res) => {
    try {
        const { fromDate, toDate, reason } = req.body;

        // ✅ CORRECTED: Added input validation
        if (!fromDate || !toDate || !reason) {
            return res.status(400).json({ 
                message: 'fromDate, toDate, and reason are required' 
            });
        }

        // ✅ CORRECTED: Added date validation
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
            return res.status(400).json({ 
                message: 'Leave start date cannot be in the past' 
            });
        }

        if (endDate < startDate) {
            return res.status(400).json({ 
                message: 'End date must be after start date' 
            });
        }

        // ✅ CORRECTED: Check for overlapping leaves
        const existingLeave = await leaves.findOne({
            employeeId: req.user.id,
            status: { $ne: 'rejected' },
            $or: [
                { fromDate: { $lte: endDate }, toDate: { $gte: startDate } }
            ]
        });

        if (existingLeave) {
            return res.status(400).json({ 
                message: 'You already have a leave request during this period' 
            });
        }

        // ✅ CORRECTED: Create leave with explicit status
        const leave = new leaves({
            employeeId: req.user.id,
            fromDate: startDate,
            toDate: endDate,
            reason,
            status: 'pending' // Explicitly set initial status
        });

        await leave.save();
        res.status(201).json({ 
            message: 'Leave applied successfully', 
            leave 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getMyLeaves = async (req, res) => {
    try {
        const myLeaves = await leaves.find({
            employeeId: req.user.id
        });
        res.status(200).json({ leaves: myLeaves });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });

    }
}

// ✅ NEW: Fetch all users' leaves (for managers/admins)
const getAllLeaves = async (req, res) => {
    try {
        // ✅ Populate employeeId with user details (name, email, etc.)
        const allLeaves = await leaves
            .find()
            .populate('employeeId', 'name email role') // Get name, email, role from User
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({ allLeaves });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const upadateLeaveStatus = async (req, res) => {
    try {
        const { leaveId, status } = req.body;

        const leave = await leaves.findByIdAndUpdate(
            leaveId,
            { status },
            { new: true }
        );
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }
        res.status(200).json({ message: 'Leave status updated successfully', leave });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });

    }
}

module.exports = {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    upadateLeaveStatus
};