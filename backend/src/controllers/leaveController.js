const leaves = require('../models/leaveModel');
const sendWhatsAppMessage = require("../services/whatsappService");


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
        // CHANGE: Set initial status to 'pending' for manager approval workflow
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
        // ✅ FIX: Populate employeeId with user details including PHONE for WhatsApp
        // Added 'phone' field to enable WhatsApp notifications in approve functions
        const allLeaves = await leaves
            .find()
            .populate('employeeId', 'name email phone role') // Get name, email, phone, role from User
            .sort({ createdAt: -1 }); // Sort by newest first

        console.log(`\\n✅ Fetched ${allLeaves.length} leaves with employee details`);
        res.status(200).json({ allLeaves });
    } catch (error) {
        console.error('❌ Error fetching all leaves:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const upadateLeaveStatus = async (req, res) => {
    try {
        const { leaveId, status } = req.body;

        const leave = await leaves.findByIdAndUpdate(
            leaveId,
            { status },
            { returnDocument: 'after' } // ✅ correct (no warning)
        ).populate('employeeId', 'name phone');

        // ✅ ADD DEBUG HERE 👇
        console.log("Leave employeeId:", leave.employeeId?._id);
        console.log("Phone:", leave.employeeId?.phone);

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        // 🔍 DEBUG (VERY IMPORTANT)
        console.log("👉 Employee:", leave.employeeId);
        console.log("👉 Phone:", leave.employeeId?.phone);
        console.log("👉 Status:", status);

        // ✅ STRICT VALIDATION (FIXED LOGIC)
        // NOTE: If phone is undefined here, the User record is missing a phone value.
        // The leave itself can still be approved, but WhatsApp cannot be sent.
        if (
            status === 'approved' &&
            leave.employeeId &&
            leave.employeeId.phone
        ) {
            const rawPhone = leave.employeeId.phone.toString().trim();
            const phone = rawPhone.startsWith("+91")
                ? rawPhone
                : rawPhone.startsWith("+")
                    ? rawPhone
                    : `+91${rawPhone}`;

            console.log("📱 Sending to:", phone);

            try {
                console.log("🚀 Sending WhatsApp...");

                await sendWhatsAppMessage(
                    phone,
                    `Hi ${leave.employeeId.name}, your leave approved ✅`
                );

                console.log("✅ WhatsApp sent successfully");

            } catch (err) {
                console.error("❌ WhatsApp Error:", err.message);
            }
        } else {
            console.warn("❌ WhatsApp skipped due to:");
            console.warn("   - Status:", status);
            console.warn("   - Employee exists:", !!leave.employeeId);
            console.warn("   - Phone exists:", !!leave.employeeId?.phone);
            console.warn("   - Phone value:", leave.employeeId?.phone);
            console.warn("   - Fix: add phone to the User record or register user with phone.");
        }

        res.status(200).json({
            message: 'Leave status updated successfully',
            leave
        });

    } catch (error) {
        console.error("❌ Update Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const approveLeave = async (req, res) => {
    try {
        const leaveId = req.params.id;

        const leave = await leaves
            .findById(leaveId)
            .populate('employeeId', 'name phone');

        if (!leave) {
            return res.status(404).json({ message: "Leave not found" });
        }

        // ✅ Update status
        leave.status = "approved";
        await leave.save();

        // 🔥 DEBUG (VERY IMPORTANT)
        console.log("👉 Employee:", leave.employeeId);
        console.log("👉 Phone:", leave.employeeId?.phone);

        // ✅ STRICT VALIDATION (FIXED)
        // NOTE: If phone is undefined here, the User record is missing a phone value.
        if (
            leave.employeeId &&
            leave.employeeId.phone
        ) {
            const rawPhone = leave.employeeId.phone.toString().trim();
            const phone = rawPhone.startsWith("+91")
                ? rawPhone
                : rawPhone.startsWith("+")
                    ? rawPhone
                    : `+91${rawPhone}`;

            console.log("📱 Sending to:", phone);

            try {
                console.log("🚀 Sending WhatsApp...");
                await sendWhatsAppMessage(
                    phone,
                    `Hi ${leave.employeeId.name}, your leave approved ✅`
                );
                console.log("✅ WhatsApp sent successfully");
            } catch (err) {
                console.error("❌ WhatsApp Error:", err.message);
            }
        } else {
            console.warn("❌ Invalid or missing phone → WhatsApp skipped");
            console.warn("   - Employee exists:", !!leave.employeeId);
            console.warn("   - Phone exists:", !!leave.employeeId?.phone);
            console.warn("   - Phone value:", leave.employeeId?.phone);
            console.warn("   - Fix: add phone to the User record or register user with phone.");
        }

        res.json({
            message: "Leave approved successfully",
            leave
        });

    } catch (error) {
        console.error("❌ Approve Error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    upadateLeaveStatus,
    approveLeave
};