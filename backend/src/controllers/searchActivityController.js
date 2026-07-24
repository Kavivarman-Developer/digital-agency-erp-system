import mongoose from "mongoose";
import SearchActivity from "../models/SearchActivity.js";

// Customer product search/view pannumbodhu idha call pannanum
export const logActivity = async (req, res) => {
  try {
    const customerId = req.user.id; // verifyToken middleware la irundhu varum
    const { productId, searchTerm, actionType, category } = req.body;

    await SearchActivity.create({
      customerId,
      productId,
      searchTerm,
      actionType,
      category,
    });

    res.status(201).json({ message: "Activity logged" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin CRM la ஒரு customer-oda top interests kaamikka
export const getCustomerInterests = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Category vechi group panni, count edukkanum - "most searched category"
    const topCategories = await SearchActivity.aggregate([
      { $match: { customerId: new mongoose.Types.ObjectId(customerId) } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }, // highest count first
      { $limit: 5 }, // top 5 categories mattum
    ]);

    // Product-wise um top 5 edukkalam
    const topProducts = await SearchActivity.aggregate([
      {
        $match: {
          customerId: new mongoose.Types.ObjectId(customerId),
          productId: { $ne: null },
        },
      },
      { $group: { _id: "$productId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products", // unga products collection name (lowercase plural)
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
    ]);

    res.json({ topCategories, topProducts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};