import Client from "../models/Client.js";

// ➕ Create Client
export const createClient = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.json(client);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// 📄 Get All Clients
export const getClients = async (req, res) => {
  const clients = await Client.find();
  res.json(clients);
};

// ✏️ Update Client
export const updateClient = async (req, res) => {
  const client = await Client.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(client);
};

// ❌ Delete Client
export const deleteClient = async (req, res) => {
  await Client.findByIdAndDelete(req.params.id);
  res.json("Client deleted");
};