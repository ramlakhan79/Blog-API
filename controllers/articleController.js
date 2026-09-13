const Article = require("../models/Article");
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

exports.getArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findOne({
      _id: id,
      // published: true,
      // archived: false,
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      article,
    });
  } catch (error) {
    next(error);
  }
};

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

    if (!title || ( !desc && !excerpt ) || !content || !category) {
      console.error("Missing required fields:", {
        title,
        desc,
        excerpt,
        content,
        category
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
