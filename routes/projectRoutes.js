const express = require("express");

const {
  getProjects,
  getProject,
  getAdminProjects,
  getAdminProject,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectPublish,
} = require("../controllers/projectController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getProjects);

router.get("/admin/all", protect, adminOnly, getAdminProjects);

router.get("/admin/:id", protect, adminOnly, getAdminProject);

router.get("/:id", getProject);

router.post("/", protect, adminOnly, createProject);

router.put("/:id", protect, adminOnly, updateProject);

router.patch("/:id/publish", protect, adminOnly, toggleProjectPublish);

router.delete("/:id", protect, adminOnly, deleteProject);

module.exports = router;
