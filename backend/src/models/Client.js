const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  industry: String,
  contactName: String,
  phone: String,
  email: String,
  projectCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }
}, { timestamps: true });

module.exports = mongoose.model("Client", clientSchema);