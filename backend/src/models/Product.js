import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  mrp: {
    type: Number
  },
  stock: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ["Accessories", "Clothing", "Footwear"],
    default: "Accessories"
  },
  image: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  offerLabel: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);