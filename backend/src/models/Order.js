import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customer: {
    type: String,
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      qty: Number,
      image: String
    }
  ],
  total: {
    type: Number,
    required: true
  },
  payment: {
    type: String,
    enum: ["PhonePe", "UPI", "Cash"],
    default: "Cash"
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "unpaid"],
    default: "unpaid"
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "shipped", "delivered"],
    default: "pending"
  },
  address: {
    type: String,
    default: ""
  }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);