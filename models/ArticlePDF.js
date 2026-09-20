const mongoose = require("mongoose");

const articlePDFSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      unique: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ArticlePDF", articlePDFSchema);
