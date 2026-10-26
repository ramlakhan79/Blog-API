const express = require("express");

const {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  archiveArticle,
  restoreArticle,
  getArchivedArticles,
  deleteArticle,
  getNextArticle,
  getPreviousArticle,
  likeArticle,
  getArticleComments,
  addArticleComment,
  deleteArticleComment,
  hideArticleComment,
  unhideArticleComment,
} = require("../controllers/articleController");

const { protect, adminOnly, contributorOnly, adminOrContributor } = require("../middleware/authMiddleware");

const { incrementArticleView } = require("../controllers/articleViewController.js");

const {
  upload,
  uploadArticleImage,
} = require("../controllers/articleImageController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Articles
|--------------------------------------------------------------------------
*/

router.get("/", getArticles);

/*
|--------------------------------------------------------------------------
| Archived Articles
|--------------------------------------------------------------------------
*/

router.get("/archived", getArchivedArticles);

/*
|--------------------------------------------------------------------------
| Single Article
|--------------------------------------------------------------------------
*/

router.get("/:slug", getArticle);

/*
|--------------------------------------------------------------------------
| Next / Previous
|--------------------------------------------------------------------------
*/

router.get("/:id/next", getNextArticle);

router.get("/:id/previous", getPreviousArticle);

/*
|--------------------------------------------------------------------------
| Create / Update
|--------------------------------------------------------------------------
*/

router.post("/", protect, adminOrContributor, createArticle);

router.put("/:id", protect, adminOrContributor, updateArticle);

router.post(
  "/upload-cover",
  protect,
  adminOrContributor,
  upload.single("image"),
  uploadArticleImage,
);

/*
|--------------------------------------------------------------------------
| Archive / Restore
|--------------------------------------------------------------------------
*/

router.patch("/:id/archive", protect, adminOnly, archiveArticle);

router.patch("/:id/restore", protect, adminOnly, restoreArticle);

/*
|--------------------------------------------------------------------------
| Permanent Delete
|--------------------------------------------------------------------------
*/

router.delete("/:id", protect, adminOnly, deleteArticle);

/*
|--------------------------------------------------------------------------
| Get Article
|--------------------------------------------------------------------------
| Public
*/

// router.get(
//     "/:id",
//     getArticle
// );


/*
|--------------------------------------------------------------------------
| Like / Unlike Article
|--------------------------------------------------------------------------
| Login required
*/

router.post(
    "/:id/like",
    protect,
    likeArticle
);


/*
|--------------------------------------------------------------------------
| Get Comments
|--------------------------------------------------------------------------
| Public
*/

router.get(
    "/:id/comments",
    getArticleComments
);


/*
|--------------------------------------------------------------------------
| Add Comment
|--------------------------------------------------------------------------
| Login required
*/

router.post(
    "/:id/comments",
    protect,
    addArticleComment
);

router.delete("/comments/:commentId", protect, deleteArticleComment);

router.post("/comments/:commentId/hide", protect, hideArticleComment);

router.post("/comments/:commentId/unhide", protect, unhideArticleComment);

router.post("/:id/view", incrementArticleView);

module.exports = router;
