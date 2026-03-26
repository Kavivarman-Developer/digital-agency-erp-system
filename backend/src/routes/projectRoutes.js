const router = require("express").Router();

const {
  createProject,
  getProjects,
  updateProject,
  deleteProject
} = require("../controllers/projectController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", verifyToken, authorizeRoles("admin", "manager"), createProject);
router.get("/", verifyToken, getProjects);
router.put("/:id", verifyToken, authorizeRoles("admin", "manager"), updateProject);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteProject);

module.exports = router;