// models/Customer.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    password: { type: String, required: true },

    // ── Orders & Spend (updated by order logic) ──────────────────────────────
    orders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    joined: { type: String, default: () => new Date().toLocaleDateString("en-IN") },

    // ── Favorites — array of Product ObjectIds ───────────────────────────────
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);