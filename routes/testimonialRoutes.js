const express = require("express");

const {
  getTestimonials,
  getTestimonial,
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialPublish,
} = require("../controllers/testimonialController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getTestimonials);

router.get("/admin/all", protect, adminOnly, getAdminTestimonials);

router.get("/:id", getTestimonial);

router.post("/", protect, adminOnly, createTestimonial);

router.put("/:id", protect, adminOnly, updateTestimonial);

router.patch("/:id/publish", protect, adminOnly, toggleTestimonialPublish);

router.delete("/:id", protect, adminOnly, deleteTestimonial);

module.exports = router;
