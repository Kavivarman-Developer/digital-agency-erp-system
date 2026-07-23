import Order from "../models/Order.js";

// POST /api/orders — Customer order place பண்ண (public)
export const createOrder = async (req, res) => {
  try {
    const { customer, items, total, payment, address } = req.body;
    if (!customer || !total) {
      return res.status(400).json({ error: "customer and total required" });
    }
    const order = await Order.create({
      customer,
      items,
      total,
      payment,
      address,
      paymentStatus: "unpaid",
      status: "pending",
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/orders — Admin all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/orders/my?name=Kavi — Customer தன் orders பாக்க (public)
// Customer name-ஐ query param-ஆ அனுப்புகிறோம் (token இல்லாம)
export const getMyOrders = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: "name query param required" });

    const orders = await Order.find({
      customer: { $regex: new RegExp(`^${name}$`, "i") } // case-insensitive match
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/orders/:id — Admin status/payment update
export const updateOrder = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const update = {};
    if (status)        update.status = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};