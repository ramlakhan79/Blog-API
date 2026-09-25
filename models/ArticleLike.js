const mongoose = require("mongoose");

const articleLikeSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

articleLikeSchema.index(
  {
    article: 1,
    user: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("ArticleLike", articleLikeSchema);
