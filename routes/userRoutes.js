const express = require("express");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  archiveUser,
  restoreUser,
  getArchivedUsers,
  deleteUser,
} = require("../controllers/userController");

const { protect, adminOnly, adminOrContributorOrUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, getUsers);

router.get("/archived", protect, adminOnly, getArchivedUsers);

router.get("/:id", protect, adminOnly, getUser);

router.post("/", protect, adminOnly, createUser);

router.put("/:id", protect, adminOrContributorOrUser, updateUser);

router.patch("/:id/archive", protect, adminOnly, archiveUser);

router.patch("/:id/restore", protect, adminOnly, restoreUser);

router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;
