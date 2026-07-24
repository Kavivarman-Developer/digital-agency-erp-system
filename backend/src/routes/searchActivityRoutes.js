import express from "express";
import { logActivity, getCustomerInterests } from "../controllers/searchActivityController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/log", verifyToken, logActivity); // customer log pannuvaanga
router.get("/:customerId", verifyToken, authorizeRoles("admin", "manager"), getCustomerInterests); // admin CRM la paakalam

export default router;