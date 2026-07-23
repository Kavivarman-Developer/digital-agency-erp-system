import express from "express";

const router = express.Router();

import { applyLeave, getMyLeaves, getAllLeaves, upadateLeaveStatus, approveLeave } from "../controllers/leaveController.js";

// CORRECTED: Changed 'authenticateUser' to 'verifyToken' (correct export from authMiddleware)
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

 router.post('/apply', verifyToken, authorizeRoles('user'), applyLeave);
// CORRECTED: Changed 'authenticateUser' to 'verifyToken'
router.get('/my-leaves', verifyToken, authorizeRoles('user'), getMyLeaves);

//  NEW: Fetch all users' leaves (managers/admins only)
router.get('/', verifyToken, authorizeRoles('admin', 'manager'), getAllLeaves);

//  CORRECTED: Changed 'authenticateUser' to 'verifyToken'
router.put(
    '/update-status',
    verifyToken,
    authorizeRoles('admin', 'manager'),
    upadateLeaveStatus
);


//  CHANGE: Added authorization middleware for manager approval
// Only managers and admins can approve leaves
router.put("/approve/:id", 
    verifyToken, 
    authorizeRoles('admin', 'manager'), 
    approveLeave
);

export default router;