const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  },

  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  deadline: Date,

  progress: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["todo", "in-progress", "completed"],
    default: "todo"
  },

  completedAt: Date,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  comments: [
    {
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],

  attachments: [String] // file URLs (simple)

}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);