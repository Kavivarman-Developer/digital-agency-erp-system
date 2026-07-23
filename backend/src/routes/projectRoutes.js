import express from "express";
const router = express.Router();

import { createProject, getProjects, updateProject, deleteProject } from "../controllers/projectController.js";

import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

router.post("/", verifyToken, authorizeRoles("admin", "manager"), createProject);
router.get("/", verifyToken, getProjects);
router.put("/:id", verifyToken, authorizeRoles("admin", "manager"), updateProject);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteProject);

export default router;