import Product from "../models/Product.js";

// GET /api/products — public, CustomerHome fetch பண்ண
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "active" });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/all — CRM admin — inactive-உம் காட்டும்
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/products — CRM admin product create
export const createProduct = async (req, res) => {
  try {
    const { name, sku, price, mrp, stock, category, image, status } = req.body;
    if (!name || !sku || !price) {
      return res.status(400).json({ error: "name, sku, price required" });
    }
    const product = await Product.create({ name, sku, price, mrp, stock, category, image, status });
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "SKU already exists" });
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/products/:id — CRM admin product update
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/products/:id — CRM admin product delete
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};