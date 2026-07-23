import express from "express";
const router = express.Router();
import { createOrder, getOrders, getMyOrders, updateOrder } from "../controllers/orderController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

// Customer — public routes (token தேவையில்லை)
router.post("/",  createOrder);
router.get("/my", getMyOrders); // ← verifyToken நீக்கினேன்

// Admin — protected routes
router.get("/",      verifyToken, getOrders);
router.patch("/:id", verifyToken, updateOrder);

export default router;