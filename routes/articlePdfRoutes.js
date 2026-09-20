const express = require("express");

const router = express.Router();

const {
  uploadPdf,
  getArticlePDF,
  viewArticlePDF,
  downloadArticlePDF,
  deleteArticlePDF,
} = require("../controllers/articlePdfController");

const uploadPdfMiddleware = require("../middleware/uploadPdf");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// Visitor + User + Contributor + Admin
router.get("/:articleId", getArticlePDF);

// Visitor + User + Contributor + Admin
router.get("/:articleId/view", viewArticlePDF);

// User + Contributor + Admin
router.get(
  "/:articleId/download",
  protect,
  allowRoles("user", "contributor", "admin"),
  downloadArticlePDF,
);

// Contributor + Admin
router.post(
  "/:articleId/upload",
  protect,
  allowRoles("contributor", "admin"),
  uploadPdfMiddleware.single("pdf"),
  uploadPdf,
);

// Contributor + Admin
router.delete(
  "/:articleId",
  protect,
  allowRoles("contributor", "admin"),
  deleteArticlePDF,
);

module.exports = router;
