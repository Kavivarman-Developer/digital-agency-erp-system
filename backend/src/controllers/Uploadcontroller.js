// controllers/uploadController.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// ── Cloudinary config — dotenv/config server.js-ல் load ஆகிவிடும் ──
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Multer — memory storage ───────────────────────────────────
export const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"), false);
    }
  },
});

// ── Buffer → Cloudinary stream upload ────────────────────────
const uploadToCloudinary = (buffer, folder = "crm_products") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });

// ── POST /api/upload ──────────────────────────────────────────
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error:", err); // server terminal-ல் காணலாம்
    res.status(500).json({ error: err.message });
  }
};