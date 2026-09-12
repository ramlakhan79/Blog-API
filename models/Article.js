// const mongoose = require("mongoose");

// const articleSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: [true, "Title is required"],
//       trim: true,
//       maxlength: 200,
//     },

//     slug: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     desc: {
//       type: String,
//       required: [true, "Description is required"],
//       trim: true,
//     },

//     content: {
//       type: String,
//       required: [true, "Article content is required"],
//     },

//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//     },

//     tags: {
//       type: [String],
//       default: [],
//     },

//     image: {
//       type: String,
//       default: "",
//     },

//     read: {
//       type: String,
//       default: "5 min read",
//     },

//     published: {
//       type: Boolean,
//       default: true,
//     },
//     archived: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// module.exports = mongoose.model("Article", articleSchema);

const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    desc: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    image: {
      type: String,
      default: "",
    },

    read: {
      type: String,
      default: "5 min read",
    },

    published: {
      type: Boolean,
      default: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    archived: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Article", articleSchema);