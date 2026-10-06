const Testimonial = require("../models/Testimonial");

const getTestimonials = async (req, res) => {
  try {
    const { featured } = req.query;

    const filter = {
      published: true,
    };

    if (featured === "true") {
      filter.featured = true;
    }

    const testimonials = await Testimonial.find(filter)
      .populate("project", "title slug image")
      .populate("createdBy", "name username avatar")
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: testimonials.length,
      testimonials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findOne({
      _id: req.params.id,
      published: true,
    })
      .populate("project", "title slug image")
      .populate("createdBy", "name username avatar");

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAdminTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .populate("project", "title slug image")
      .populate("createdBy", "name username avatar email")
      .populate("updatedBy", "name username avatar email")
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: testimonials.length,
      testimonials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createTestimonial = async (req, res) => {
  try {
    const {
      name,
      role,
      company,
      avatar,
      rating,
      message,
      linkedinUrl,
      websiteUrl,
      project,
      featured,
      published,
      order,
    } = req.body;

    if (!name || !message) {
      return res.status(400).json({
        success: false,
        message: "Name and message are required",
      });
    }

    const testimonial = await Testimonial.create({
      name,
      role,
      company,
      avatar,
      rating,
      message,
      linkedinUrl,
      websiteUrl,
      project: project || null,
      featured,
      published,
      order,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    const populatedTestimonial = await Testimonial.findById(testimonial._id)
      .populate("project", "title slug image")
      .populate("createdBy", "name username avatar")
      .populate("updatedBy", "name username avatar");

    res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      testimonial: populatedTestimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    const allowedFields = [
      "name",
      "role",
      "company",
      "avatar",
      "rating",
      "message",
      "linkedinUrl",
      "websiteUrl",
      "project",
      "featured",
      "published",
      "order",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        testimonial[field] = req.body[field];
      }
    });

    testimonial.updatedBy = req.user._id;

    await testimonial.save();

    const updatedTestimonial = await Testimonial.findById(testimonial._id)
      .populate("project", "title slug image")
      .populate("createdBy", "name username avatar")
      .populate("updatedBy", "name username avatar");

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      testimonial: updatedTestimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    await Testimonial.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const toggleTestimonialPublish = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    testimonial.published = !testimonial.published;
    testimonial.updatedBy = req.user._id;

    await testimonial.save();

    res.status(200).json({
      success: true,
      message: testimonial.published
        ? "Testimonial published successfully"
        : "Testimonial unpublished successfully",
      published: testimonial.published,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getTestimonials,
  getTestimonial,
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialPublish,
};
