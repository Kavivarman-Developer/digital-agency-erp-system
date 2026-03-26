const router = require("express").Router();

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  addComment,
  completeTask
} = require("../controllers/taskController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const Task = require("../models/Task");

router.post("/", verifyToken, authorizeRoles("admin", "manager"), createTask);
router.get("/", verifyToken, getTasks);
router.put("/:id", verifyToken, authorizeRoles("admin", "manager"), updateTask);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteTask);



// 💬 comment
router.post("/:id/comment", verifyToken, addComment);

// 🔥 Get My Tasks (USER PAGE)
router.get("/my", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await Task.find({ assignedTo: userId })
      .populate("projectId")
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role");

    res.json(tasks);

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ✅ Mark complete
router.post("/:id/complete", verifyToken, completeTask);

module.exports = router;