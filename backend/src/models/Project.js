const mongoose = require("mongoose");

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

module.exports = mongoose.model("Project", projectSchema);