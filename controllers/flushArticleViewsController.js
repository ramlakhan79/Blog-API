const redis = require("../config/redis");
const mongoose = require("mongoose");
const { Article } = require("../models/Article");

const PENDING_VIEWS_KEY = "article_views_pending";

const DRAIN_SCRIPT = `
  local values = redis.call("HGETALL", KEYS[1])
  redis.call("DEL", KEYS[1])
  return values
`;

const flushArticleViews = async (req, res, next) => {
  let counts = [];

  try {
    if (
      !process.env.CRON_SECRET ||
      req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await redis.eval(DRAIN_SCRIPT, [PENDING_VIEWS_KEY], []);

    const values = Array.isArray(result) ? result : [];

    for (let i = 0; i + 1 < values.length; i += 2) {
      const id = String(values[i]);
      const count = Number(values[i + 1]);

      if (
        mongoose.isValidObjectId(id) &&
        Number.isSafeInteger(count) &&
        count > 0
      ) {
        counts.push({ id, count });
      }
    }

    if (counts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No pending article views",
        articlesUpdated: 0,
        viewsFlushed: 0,
      });
    }

    const operations = counts.map(({ id, count }) => ({
      updateOne: {
        filter: {
          _id: new mongoose.Types.ObjectId(id),
          published: true,
          $or: [
            { archived: false },
            { archived: { $exists: false } },
          ],
        },
        update: {
          $inc: { views: count },
        },
      },
    }));

    const bulkResult = await Article.bulkWrite(operations, {
      ordered: false,
    });

    console.log("MongoDB bulk result:", {
      matchedCount: bulkResult.matchedCount,
      modifiedCount: bulkResult.modifiedCount,
      upsertedCount: bulkResult.upsertedCount,
    });
    
    return res.status(200).json({
      success: true,
      message: "Article views flushed successfully",
      articlesUpdated: bulkResult.modifiedCount,
      viewsFlushed: counts.reduce(
        (total, item) => total + item.count,
        0
      ),
    });
  } catch (error) {
    if (counts.length > 0) {
      try {
        await Promise.all(
          counts.map(({ id, count }) =>
            redis.hincrby(PENDING_VIEWS_KEY, id, count)
          )
        );
      } catch (restoreError) {
        console.error(
          "CRITICAL: Unable to restore pending views",
          restoreError
        );
      }
    }

    next(error);
  }
};

module.exports = { flushArticleViews };