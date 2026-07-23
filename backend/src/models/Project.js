import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },

  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client"
  },

  teamMembers: [String], // simple (names/emails)

  deadline: Date,

  progress: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending"
  }

}, { timestamps: true });

export default mongoose.model("Project", projectSchema);