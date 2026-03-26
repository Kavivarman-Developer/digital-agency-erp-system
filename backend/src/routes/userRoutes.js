const router = require("express").Router();
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find().select("_id name email role");
    res.json(users);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;