const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Article = require("../models/Article");
const User = require("../models/User");

const ArticleLike = require("../models/ArticleLike");

const ArticleComment = require("../models/ArticleComment");
const slugify = require("slugify");

const generateUniqueSlug = async (title, articleId = null) => {
  const baseSlug = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };

    if (articleId) {
      query._id = { $ne: articleId };
    }

    const existingArticle = await Article.findOne(query);

    if (!existingArticle) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL PUBLIC ARTICLES
|--------------------------------------------------------------------------
| GET /api/articles
|--------------------------------------------------------------------------
*/

exports.getArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({
      // published: true,
      // archived: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE PUBLIC ARTICLE
|--------------------------------------------------------------------------
| GET /api/articles/:id
|--------------------------------------------------------------------------
*/

// exports.getArticle = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const article = await Article.findOne({
//       _id: id,
//       // published: true,
//       // archived: false,
//     });

//     if (!article) {
//       return res.status(404).json({
//         success: false,
//         message: "Article not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       article,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

/*
|--------------------------------------------------------------------------
| CREATE ARTICLE
|--------------------------------------------------------------------------
| POST /api/articles
|--------------------------------------------------------------------------
*/

exports.createArticle = async (req, res, next) => {
  try {
    const excerpt = req.body.excerpt;
    if (excerpt && !req.body.desc) {
      req.body.desc = excerpt;
    }
    const { title, desc, content, category, tags, image, read, published } =
      req.body;

    if (!title || (!desc && !excerpt) || !content || !category) {
      console.error("Missing required fields:", {
        title,
        desc,
        excerpt,
        content,
        category,
      });
      return res.status(400).json({
        success: false,
        message: "Title, description, content and category are required",
      });
    }
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const slug = await generateUniqueSlug(title);
    const article = await Article.create({
      title: title.trim(),
      slug,
      desc: desc.trim(),
      content,
      category: category.trim(),
      tags: Array.isArray(tags) ? tags : [],
      image: image || "",
      read: read || "5 min read",
      published: published !== undefined ? published : true,
      publishedAt: published !== false ? new Date() : null,
      archived: false,

      createdBy: req.user.username,
      updatedBy: req.user.username,
    });

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      article,
    });
  } catch (error) {
    console.error("Error creating article:", error);
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE ARTICLE
|--------------------------------------------------------------------------
| PUT /api/articles/:id
|--------------------------------------------------------------------------
*/

exports.updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }
    const excerpt = req.body.excerpt;
    if (excerpt && !req.body.desc) {
      req.body.desc = excerpt;
    }

    const { title, desc, content, category, tags, image, read, published } =
      req.body;
    let slug = article.slug;

    if (title && title !== article.title) {
      slug = await generateUniqueSlug(title, id);
    }

    article.title = title ?? article.title;
    article.slug = slug;
    article.desc = desc ?? article.desc;
    article.content = content ?? article.content;
    article.category = category ?? article.category;

    article.tags = Array.isArray(tags) ? tags : article.tags;

    article.image = image ?? article.image;
    article.read = read ?? article.read;

    article.published = published !== undefined ? published : article.published;

    article.updatedBy = req.user.username;

    const updatedArticle = await article.save();

    res.status(200).json({
      success: true,
      message: "Article updated successfully",
      article: updatedArticle,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ARCHIVE ARTICLE
|--------------------------------------------------------------------------
| PATCH /api/articles/:id/archive
|--------------------------------------------------------------------------
*/

exports.archiveArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    if (article.archived) {
      return res.status(400).json({
        success: false,
        message: "Article is already archived",
      });
    }

    article.archived = true;

    await article.save();

    res.status(200).json({
      success: true,
      message: "Article archived successfully",
      article,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| RESTORE ARTICLE
|--------------------------------------------------------------------------
| PATCH /api/articles/:id/restore
|--------------------------------------------------------------------------
*/

exports.restoreArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    if (!article.archived) {
      return res.status(400).json({
        success: false,
        message: "Article is not archived",
      });
    }

    article.archived = false;

    await article.save();

    res.status(200).json({
      success: true,
      message: "Article restored successfully",
      article,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET ARCHIVED ARTICLES
|--------------------------------------------------------------------------
| GET /api/articles/archived
|--------------------------------------------------------------------------
*/

exports.getArchivedArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({
      archived: true,
    }).sort({
      updatedAt: -1,
    });

    res.status(200).json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PERMANENT DELETE
|--------------------------------------------------------------------------
| DELETE /api/articles/:id
|--------------------------------------------------------------------------
*/

exports.deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Article permanently deleted",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| NEXT ARTICLE
|--------------------------------------------------------------------------
| GET /api/articles/:id/next
|--------------------------------------------------------------------------
*/

exports.getNextArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const currentArticle = await Article.findOne({
      _id: id,
      published: true,
      archived: false,
    });

    if (!currentArticle) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    const nextArticle = await Article.findOne({
      published: true,
      archived: false,
      createdAt: {
        $gt: currentArticle.createdAt,
      },
    }).sort({
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      article: nextArticle || null,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PREVIOUS ARTICLE
|--------------------------------------------------------------------------
| GET /api/articles/:id/previous
|--------------------------------------------------------------------------
*/

exports.getPreviousArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const currentArticle = await Article.findOne({
      _id: id,
      published: true,
      archived: false,
    });

    if (!currentArticle) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    const previousArticle = await Article.findOne({
      published: true,
      archived: false,
      createdAt: {
        $lt: currentArticle.createdAt,
      },
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      article: previousArticle || null,
    });
  } catch (error) {
    next(error);
  }
};

exports.getArticle = async (req, res) => {
  try {
    const { id } = req.params;

    /*
        |--------------------------------------------------------------------------
        | Validate article ID
        |--------------------------------------------------------------------------
        */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID",
      });
    }

    /*
        |--------------------------------------------------------------------------
        | Find article
        |--------------------------------------------------------------------------
        */

    const article = await Article.findOne({
      _id: id,
      published: true,
      archived: false,
    }).lean();

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    /*
        |--------------------------------------------------------------------------
        | Find article author
        |--------------------------------------------------------------------------
        |
        | Your Article stores createdBy as username:
        |
        | createdBy: req.user.username
        |
        |--------------------------------------------------------------------------
        */

    let author = null;

    if (article.createdBy) {
      author = await User.findOne({
        username: article.createdBy,
      })
        .select("_id name username avatar profileImage")
        .lean();
    }

    /*
        |--------------------------------------------------------------------------
        | Like count
        |--------------------------------------------------------------------------
        */

    const likesCount = await ArticleLike.countDocuments({
      article: article._id,
    });

    /*
        |--------------------------------------------------------------------------
        | Comment count
        |--------------------------------------------------------------------------
        */

    const commentsCount = await ArticleComment.countDocuments({
      article: article._id,
      hidden: { $ne: true },
    });

    /*
        |--------------------------------------------------------------------------
        | Check whether current user liked article
        |--------------------------------------------------------------------------
        */

    let isLiked = false;

    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const existingLike = await ArticleLike.exists({
          article: article._id,
          user: decoded.id,
        });

        isLiked = !!existingLike;
      } catch (error) {
        /*
         * Invalid/expired token should not
         * prevent public article viewing.
         */

        isLiked = false;
      }
    }

    /*
        |--------------------------------------------------------------------------
        | Final response
        |--------------------------------------------------------------------------
        */

    return res.status(200).json({
      success: true,

      article: {
        ...article,

        /*
                |--------------------------------------------------------------------------
                | Author information
                |--------------------------------------------------------------------------
                */

        authorDetails: author
          ? {
              _id: author._id,
              name: author.name,
              username: author.username,
              profileImage: author.profileImage || author.avatar || null,
            }
          : {
              _id: null,
              name: article.createdBy || "Anonymous",
              username: article.createdBy || "",
              profileImage: null,
            },

        /*
                |--------------------------------------------------------------------------
                | Engagement
                |--------------------------------------------------------------------------
                */

        likesCount,

        commentsCount,

        isLiked,
      },
    });
  } catch (error) {
    console.error("Get article error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch article",
    });
  }
};

exports.likeArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID",
      });
    }

    const article = await Article.findOne({
      _id: id,
      published: true,
      archived: false,
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    /*
        |--------------------------------------------------------------------------
        | Check existing like
        |--------------------------------------------------------------------------
        */

    const existingLike = await ArticleLike.findOne({
      article: id,
      user: userId,
    });

    /*
        |--------------------------------------------------------------------------
        | Unlike
        |--------------------------------------------------------------------------
        */

    if (existingLike) {
      await ArticleLike.deleteOne({
        _id: existingLike._id,
      });

      const likesCount = await ArticleLike.countDocuments({
        article: id,
      });

      return res.status(200).json({
        success: true,

        liked: false,

        likesCount,

        message: "Article unliked successfully",
      });
    }

    /*
        |--------------------------------------------------------------------------
        | Like
        |--------------------------------------------------------------------------
        */

    try {
      await ArticleLike.create({
        article: id,
        user: userId,
      });
    } catch (error) {
      /*
       * Protect against duplicate likes
       * in case two requests arrive together.
       */

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Article already liked",
        });
      }

      throw error;
    }

    const likesCount = await ArticleLike.countDocuments({
      article: id,
    });

    return res.status(200).json({
      success: true,

      liked: true,

      likesCount,

      message: "Article liked successfully",
    });
  } catch (error) {
    console.error("Like article error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to like article",
    });
  }
};

exports.getArticleComments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID",
      });
    }

    const article = await Article.exists({
      _id: id,
      published: true,
      archived: false,
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }
   
    const comments = await ArticleComment.find({
      article: id,
      // Existing comments without the field
      // are also treated as visible.

      hidden: {
        $ne: true,
      },
    })
      .populate("user", "name username avatar profileImage")
      .sort({
        createdAt: -1,
      })
      .lean();
    
       return res.status(200).json({
         success: true,

         count: comments.length,

         comments,
       });    
     
  } catch (error) {
    console.error("Get comments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

exports.addArticleComment = async (req, res) => {
  try {
    const { id } = req.params;

    const { content } = req.body;

    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 2000 characters",
      });
    }

    const article = await Article.exists({
      _id: id,
      published: true,
      archived: false,
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    const comment = await ArticleComment.create({
      article: id,

      user: userId,

      content: content.trim(),
    });

    const populatedComment = await ArticleComment.findById(comment._id)
      .populate("user", "name username avatar profileImage")
      .lean();

    return res.status(201).json({
      success: true,

      message: "Comment added successfully",

      comment: populatedComment,
    });
  } catch (error) {
    console.error("Add comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};

exports.deleteArticleComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
    }

    const comment = await ArticleComment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // User can delete ONLY their own comment
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own comment",
      });
    }

    await ArticleComment.deleteOne({
      _id: commentId,
    });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      commentId,
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
};

exports.hideArticleComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
    }

    const comment = await ArticleComment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    comment.hidden = true;

    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Comment hidden successfully",
      commentId,
    });
  } catch (error) {
    console.error("Hide comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to hide comment",
    });
  }
};

exports.unhideArticleComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
    }

    const comment = await ArticleComment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    comment.hidden = false;

    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Comment unhidden successfully",
      commentId,
    });
  } catch (error) {
    console.error("Unhide comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to unhide comment",
    });
  }
};
