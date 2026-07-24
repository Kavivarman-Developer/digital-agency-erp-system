// routes/customerRoutes.js
import express from "express";
import {
  getAllCustomers,
  getCustomerById,
  getMyFavorites,
  toggleFavorite,
  clearFavorites,
  getCustomerFavoritesByAdmin,
} from "../controllers/Customercontroller.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Customer Portal routes — MUST come BEFORE /:id routes ────────────────────
// Express matches top-to-bottom; if /:id is first, "me" gets treated as an id!
router.get("/me/favorites", verifyToken, getMyFavorites);               // GET my favorites
router.post("/me/favorites/:productId", verifyToken, toggleFavorite);   // Toggle add/remove
router.delete("/me/favorites", verifyToken, clearFavorites);            // Clear all

// ── CRM Admin routes ──────────────────────────────────────────────────────────
router.get("/", verifyToken, getAllCustomers);
router.get("/:id", verifyToken, getCustomerById);
router.get("/:id/favorites", verifyToken, getCustomerFavoritesByAdmin); // Admin: view any customer's favorites

export default router;
