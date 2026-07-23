// routes/customerRoutes.js
import express from "express";
import {
  getAllCustomers,
  getCustomerById,
  getMyFavorites,
  toggleFavorite,
  clearFavorites,
  getCustomerFavoritesByAdmin,
} from "../controllers/customerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Customer Portal routes — MUST come BEFORE /:id routes ────────────────────
// Express matches top-to-bottom; if /:id is first, "me" gets treated as an id!
router.get("/me/favorites", protect, getMyFavorites);               // GET my favorites
router.post("/me/favorites/:productId", protect, toggleFavorite);   // Toggle add/remove
router.delete("/me/favorites", protect, clearFavorites);            // Clear all

// ── CRM Admin routes ──────────────────────────────────────────────────────────
router.get("/", protect, getAllCustomers);
router.get("/:id", protect, getCustomerById);
router.get("/:id/favorites", protect, getCustomerFavoritesByAdmin); // Admin: view any customer's favorites

export default router;