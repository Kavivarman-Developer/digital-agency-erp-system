// routes/Uploadroute.js
import express from "express";
import { upload, uploadImage } from "../controllers/Uploadcontroller.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/upload
// verifyToken → multer → uploadImage (இந்த order important)
router.post("/", verifyToken, upload.single("image"), uploadImage);

export default router;