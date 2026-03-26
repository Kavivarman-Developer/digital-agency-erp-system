const Task = require("../models/Task");


// ➕ Create
exports.createTask = async (req, res) => {
  // ensure assignedBy is recorded
  const payload = { ...req.body, assignedBy: req.user.id };
  const task = await Task.create(payload);
  res.json(task);
};

// 📄 Get All
exports.getTasks = async (req, res) => {
  // allow manager to filter tasks they assigned with ?assignedBy=my
  const filter = {};

  if (req.query.assignedBy === "my") {
    filter.assignedBy = req.user.id;
  }

  const tasks = await Task.find(filter)
    .populate("projectId")
    .populate("assignedTo", "name email role")
    .populate("assignedBy", "name email role")
    .populate("completedBy", "name email role");

  res.json(tasks);
};

// ✏️ Update
exports.updateTask = async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(task);
};

// Mark task as completed by the current user
exports.completeTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json("Task not found");

  const userId = req.user.id;

  // only assigned users can mark their task complete (or managers/admins)
  const isAssigned = task.assignedTo.some(a => String(a) === String(userId));
  if (!isAssigned && !["manager", "admin"].includes(req.user.role)) {
    return res.status(403).json("Not authorized to complete this task");
  }

  task.status = "completed";
  task.progress = 100;
  task.completedAt = new Date();
  task.completedBy = userId;

  await task.save();

  const populated = await Task.findById(task._id)
    .populate("projectId")
    .populate("assignedTo", "name email role")
    .populate("assignedBy", "name email role")
    .populate("completedBy", "name email role");

  res.json(populated);
};

// ❌ Delete
exports.deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json("Deleted");
};

// 💬 Add Comment
exports.addComment = async (req, res) => {
  const task = await Task.findById(req.params.id);

  task.comments.push({ text: req.body.text });

  await task.save();

  res.json(task);
};