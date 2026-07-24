import mongoose from "mongoose";

const searchActivitySchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or "Customer" - unga customer model name
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false, // search query-ku product illama irukkalam
    },
    searchTerm: {
      type: String, // customer type panna text - "shoes", "watch" etc
    },
    actionType: {
      type: String,
      enum: ["search", "view", "click"], // 3 types of activity track pannalam
      required: true,
    },
    category: {
      type: String, // product category - analytics ku easy aagum
    },
  },
  { timestamps: true } // createdAt automatic-a varum
);

export default mongoose.model("SearchActivity", searchActivitySchema);