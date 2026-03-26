const router = require("express").Router();
const {
  createClient,
  getClients,
  updateClient,
  deleteClient
} = require("../controllers/clientController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", verifyToken, authorizeRoles("admin", "manager"), createClient);
router.get("/", verifyToken, authorizeRoles("admin", "manager"), getClients);
router.put("/:id", verifyToken, authorizeRoles("admin", "manager"), updateClient);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteClient);

module.exports = router;