const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const ArticlePDF = require("../models/ArticlePDF");
const Article = require("../models/Article");

const uploadPdf = async (req, res) => {
  try {
    const { articleId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "PDF file is required",
      });
    }

    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    const existingPDF = await ArticlePDF.findOne({
      article: articleId,
    });

    if (existingPDF) {
      await cloudinary.uploader.destroy(existingPDF.publicId, {
        resource_type: "image",
      });

      await ArticlePDF.deleteOne({
        _id: existingPDF._id,
      });
    }

    const publicId = `article-pdfs/${articleId}-${Date.now()}`;

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          public_id: publicId.replace(".pdf", ""),
          format: "pdf",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const pdf = await ArticlePDF.create({
      article: articleId,
      fileName: req.file.originalname,
      publicId: result.public_id,
      url: result.secure_url,
      size: req.file.size,
      uploadedBy: req.user.id,
    });

    return res.status(201).json({
      message: "PDF uploaded successfully",
      pdf: {
        id: pdf._id,
        article: pdf.article,
        fileName: pdf.fileName,
        size: pdf.size,
        url: pdf.url,
        uploadedBy: pdf.uploadedBy,
        createdAt: pdf.createdAt,
      },
    });
  } catch (error) {
    console.error("PDF upload error:", error);

    return res.status(500).json({
      message: "Failed to upload PDF",
    });
  }
};

const getArticlePDF = async (req, res) => {
  try {
    const { articleId } = req.params;
    const pdf = await ArticlePDF.findOne({
      article: articleId,
    });

    if (!pdf) {
      return res.status(404).json({
        message: "PDF not found",
      });
    }

    return res.status(200).json({
      id: pdf._id,
      article: pdf.article,
      fileName: pdf.fileName,
      size: pdf.size,
      url: pdf.url,
      createdAt: pdf.createdAt,
    });
  } catch (error) {
    console.error("Get PDF error:", error);

    return res.status(500).json({
      message: "Failed to get PDF",
    });
  }
};

const viewArticlePDF = async (req, res) => {
  try {
    const { articleId } = req.params;

    const pdf = await ArticlePDF.findOne({
      article: articleId,
    });

    if (!pdf) {
      return res.status(404).json({
        message: "PDF not found",
      });
    }

    const response = await fetch(pdf.url);

    if (!response.ok) {
      return res.status(404).json({
        message: "Unable to load PDF",
      });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${pdf.fileName}"`);

    return res.send(buffer);
  } catch (error) {
    console.error("View PDF error:", error);

    return res.status(500).json({
      message: "Failed to view PDF",
    });
  }
};

const downloadArticlePDF = async (req, res) => {
  try {
    const { articleId } = req.params;

    const pdf = await ArticlePDF.findOne({
      article: articleId,
    });

    if (!pdf) {
      return res.status(404).json({
        message: "PDF not found",
      });
    }

    const response = await fetch(pdf.url);

    if (!response.ok) {
      return res.status(404).json({
        message: "Unable to load PDF",
      });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pdf.fileName}"`,
    );

    return res.send(buffer);
  } catch (error) {
    console.error("Download PDF error:", error);

    return res.status(500).json({
      message: "Failed to download PDF",
    });
  }
};

const deleteArticlePDF = async (req, res) => {
  try {
    const { articleId } = req.params;

    const pdf = await ArticlePDF.findOne({
      article: articleId,
    });

    if (!pdf) {
      return res.status(404).json({
        message: "PDF not found",
      });
    }

    await cloudinary.uploader.destroy(pdf.publicId, {
      resource_type: "image",
    });

    await ArticlePDF.deleteOne({
      _id: pdf._id,
    });

    return res.status(200).json({
      message: "PDF deleted successfully",
    });
  } catch (error) {
    console.error("Delete PDF error:", error);

    return res.status(500).json({
      message: "Failed to delete PDF",
    });
  }
};

module.exports = {
  uploadPdf,
  getArticlePDF,
  viewArticlePDF,
  downloadArticlePDF,
  deleteArticlePDF,
};
