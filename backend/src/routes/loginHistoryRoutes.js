const router = require("express").Router();
const LoginHistory = require("../models/LoginHistory");
const { verifyToken } = require("../middleware/authMiddleware");

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

module.exports = router;