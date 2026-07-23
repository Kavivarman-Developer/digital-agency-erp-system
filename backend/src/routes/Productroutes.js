import express from "express";
const router = express.Router();
import { getProducts, getAllProducts, createProduct, updateProduct, deleteProduct } from "../controllers/Productcontroller.js";

import { verifyToken } from "../middleware/authMiddleware.js";

// PUBLIC — CustomerHome fetch 
router.get("/", getProducts);

// ADMIN — CRM Products.jsx
router.get("/all", verifyToken, getAllProducts);
router.post("/", verifyToken, createProduct);
router.put("/:id", verifyToken, updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;