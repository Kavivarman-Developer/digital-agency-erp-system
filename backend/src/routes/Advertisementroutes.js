// routes/advertisementRoutes.js
import express from "express";
import {
  getActiveAdvertisements,
  getAllAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  trackClick,
} from "../controllers/advertisementController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── PUBLIC (no token needed) ──────────────────────────────────────────────────
router.get("/", getActiveAdvertisements); // CustomerHome fetch
router.post("/:id/click", trackClick);              // CTA click tracking

// ── ADMIN (token required) ────────────────────────────────────────────────────
router.get("/all", verifyToken, getAllAdvertisements);
router.post("/", verifyToken, createAdvertisement);
router.put("/:id", verifyToken, updateAdvertisement);
router.delete("/:id", verifyToken, deleteAdvertisement);

export default router;