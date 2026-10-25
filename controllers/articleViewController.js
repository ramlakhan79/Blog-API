// const Article = require("../models/Article");

// const incrementArticleView = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     // if (!mongoose.isValidObjectId(id)) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: "Invalid article ID",
//     //   });
//     // }

//     const article = await Article.findOneAndUpdate(
//       {
//         _id: id,
//         published: true,
//         $or: [{ archived: false }, { archived: { $exists: false } }],
//       },
//       {
//         $inc: { views: 1 },
//       },
//       {
//         new: true,
//         projection: { _id: 1, views: 1 },
//       },
//     );

//     if (!article) {
//       return res.status(404).json({
//         success: false,
//         message: "Published article not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Article view counted",
//       views: article.views,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   incrementArticleView,
// };

const mongoose = require("mongoose");
const redis = require("../config/redis");
const Article = require("../models/Article");

const PENDING_VIEWS_KEY = "article_views_pending";

const incrementArticleView = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID",
      });
    }

    const articleExists = await Article.exists({
      _id: id,
      published: true,
      $or: [{ archived: false }, { archived: { $exists: false } }],
    });

    if (!articleExists) {
      return res.status(404).json({
        success: false,
        message: "Published article not found",
      });
    }

    const pendingViews = await redis.hincrby(PENDING_VIEWS_KEY, id, 1);
    // console.log(`Incremented pending views for article ${id}. Total pending views: ${pendingViews}`);
    return res.status(202).json({
      success: true,
      message: "Article view queued",
      pendingViews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  incrementArticleView,
};