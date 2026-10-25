const express = require("express");
const { flushArticleViews } = require("../controllers/flushArticleViewsController");

const router = express.Router();

router.post("/flush-article-views", flushArticleViews);

module.exports = router;
