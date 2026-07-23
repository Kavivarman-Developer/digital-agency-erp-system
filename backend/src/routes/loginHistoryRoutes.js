import express from "express";
const router = express.Router();
import LoginHistory from "../models/LoginHistory.js";
import { verifyToken } from "../middleware/authMiddleware.js";

// 👑 Admin → see all logs
router.get("/", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json("Only admin allowed");
  }

  const logs = await LoginHistory.find().sort({ loginTime: -1 });
  res.json(logs);
});

// 👤 User → see own logs
router.get("/my", verifyToken, async (req, res) => {
  const logs = await LoginHistory.find({ userId: req.user.id });
  res.json(logs);
});

export default router;