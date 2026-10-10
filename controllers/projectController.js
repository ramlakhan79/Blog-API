const Project = require("../models/Project");
const createSlug = require("../utils/createSlug");

const getProjects = async (req, res) => {
  try {
    const { featured, category } = req.query;

    const filter = {
      published: true,
    };

    if (featured === "true") {
      filter.featured = true;
    }

    if (category) {
      filter.category = category;
    }

    const projects = await Project.find(filter)
      .populate("createdBy", "name username avatar")
      .populate("updatedBy", "name username avatar")
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
      published: true,
    })
      .populate("createdBy", "name username avatar")
      .populate("updatedBy", "name username avatar");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAdminProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("createdBy", "name username avatar email")
      .populate("updatedBy", "name username avatar email")
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAdminProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name username avatar email")
      .populate("updatedBy", "name username avatar email");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createProject = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      description,
      image,
      gallery,
      technologies,
      features,
      role,
      category,
      githubUrl,
      liveUrl,
      demoVideo,
      challenges,
      solution,
      results,
      startDate,
      endDate,
      status,
      featured,
      published,
      order,
    } = req.body;

    if (!title || !shortDescription || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, short description and description are required",
      });
    }

    let slug = createSlug(title);

    const existingProject = await Project.findOne({ slug });

    if (existingProject) {
      slug = `${slug}-${Date.now()}`;
    }

    const project = await Project.create({
      title,
      slug,
      shortDescription,
      description,
      image,
      gallery,
      technologies,
      features,
      role,
      category,
      githubUrl,
      liveUrl,
      demoVideo,
      challenges,
      solution,
      results,
      startDate,
      endDate,
      status,
      featured,
      published,
      order,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    const populatedProject = await Project.findById(project._id)
      .populate("createdBy", "name username avatar")
      .populate("updatedBy", "name username avatar");

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: populatedProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const allowedFields = [
      "title",
      "shortDescription",
      "description",
      "image",
      "gallery",
      "technologies",
      "features",
      "role",
      "category",
      "githubUrl",
      "liveUrl",
      "demoVideo",
      "challenges",
      "solution",
      "results",
      "startDate",
      "endDate",
      "status",
      "featured",
      "published",
      "order",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    if (req.body.title && req.body.title !== project.title) {
      let slug = createSlug(req.body.title);

      const existingProject = await Project.findOne({
        slug,
        _id: { $ne: project._id },
      });

      if (existingProject) {
        slug = `${slug}-${Date.now()}`;
      }

      project.slug = slug;
    }

    project.updatedBy = req.user._id;

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("createdBy", "name username avatar")
      .populate("updatedBy", "name username avatar");

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const toggleProjectPublish = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.published = !project.published;
    project.updatedBy = req.user._id;

    await project.save();

    res.status(200).json({
      success: true,
      message: project.published
        ? "Project published successfully"
        : "Project unpublished successfully",
      published: project.published,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  getAdminProjects,
  getAdminProject,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectPublish,
};
