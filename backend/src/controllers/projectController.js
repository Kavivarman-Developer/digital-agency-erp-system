const Project = require("../models/Project");

// ➕ Create
exports.createProject = async (req, res) => {
  const project = await Project.create(req.body);
  res.json(project);
};

// 📄 Get All
exports.getProjects = async (req, res) => {
  const projects = await Project.find().populate("clientId");
  res.json(projects);
};

// ✏️ Update
exports.updateProject = async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(project);
};

// ❌ Delete
exports.deleteProject = async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json("Deleted");
};