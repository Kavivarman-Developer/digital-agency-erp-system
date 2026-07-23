import mongoose from "mongoose";

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

export default mongoose.model("Client", clientSchema);