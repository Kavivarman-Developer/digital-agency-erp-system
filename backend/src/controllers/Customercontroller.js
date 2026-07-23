// controllers/customerController.js
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/customers — CRM: all customers list
// ─────────────────────────────────────────────────────────────────────────────
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .select("-password")
      .populate("favorites", "name price mrp image category offerLabel stock")
      .sort({ createdAt: -1 })
      .lean();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/customers/:id — single customer with favorites populated
// ─────────────────────────────────────────────────────────────────────────────
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .select("-password")
      .populate("favorites", "name price mrp image category offerLabel stock status");
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/customers/me/favorites — Customer portal: get MY favorites
// Requires customer auth token
// ─────────────────────────────────────────────────────────────────────────────
export const getMyFavorites = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id)
      .populate("favorites", "name price mrp image category offerLabel stock status");
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer.favorites || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/customers/me/favorites/:productId — Toggle favorite (add/remove)
// Returns updated favorites array
// ─────────────────────────────────────────────────────────────────────────────
export const toggleFavorite = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const productId = req.params.productId;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const alreadyFavorited = customer.favorites.some(
      (id) => id.toString() === productId
    );

    if (alreadyFavorited) {
      // Remove from favorites
      customer.favorites = customer.favorites.filter(
        (id) => id.toString() !== productId
      );
    } else {
      // Add to favorites
      customer.favorites.push(productId);
    }

    await customer.save();

    // Return populated favorites
    const updated = await Customer.findById(req.user.id)
      .populate("favorites", "name price mrp image category offerLabel stock status");

    res.json({
      favorites: updated.favorites,
      action: alreadyFavorited ? "removed" : "added",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/customers/me/favorites — Clear ALL favorites
// ─────────────────────────────────────────────────────────────────────────────
export const clearFavorites = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    customer.favorites = [];
    await customer.save();
    res.json({ favorites: [], message: "All favorites cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/customers/:id/favorites — CRM Admin: view any customer's favorites
// ─────────────────────────────────────────────────────────────────────────────
export const getCustomerFavoritesByAdmin = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .select("name email favorites")
      .populate("favorites", "name price mrp image category offerLabel stock status");
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json({
      customer: { name: customer.name, email: customer.email },
      favorites: customer.favorites || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};