import express from "express";
const router = express.Router();
import { createClient, getClients, updateClient, deleteClient } from "../controllers/clientController.js";

import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

router.post("/", verifyToken, authorizeRoles("admin", "manager"), createClient);
router.get("/", verifyToken, authorizeRoles("admin", "manager"), getClients);
router.put("/:id", verifyToken, authorizeRoles("admin", "manager"), updateClient);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteClient);

export default router;