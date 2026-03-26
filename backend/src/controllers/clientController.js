const Client = require("../models/Client");

// ➕ Create Client
exports.createClient = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.json(client);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// 📄 Get All Clients
exports.getClients = async (req, res) => {
  const clients = await Client.find();
  res.json(clients);
};

// ✏️ Update Client
exports.updateClient = async (req, res) => {
  const client = await Client.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(client);
};

// ❌ Delete Client
exports.deleteClient = async (req, res) => {
  await Client.findByIdAndDelete(req.params.id);
  res.json("Client deleted");
};