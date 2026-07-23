import express from "express";
const router = express.Router();

import { createTask, getTasks, updateTask, deleteTask, addComment, completeTask } from "../controllers/taskController.js";

import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import Task from "../models/Task.js";

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

export default router;