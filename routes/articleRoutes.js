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
} = require("../controllers/articleController");

const { protect, adminOnly, contributorOnly, adminOrContributor } = require("../middleware/authMiddleware");

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

router.get("/:id", getArticle);

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

module.exports = router;
