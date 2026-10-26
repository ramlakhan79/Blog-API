const cloudinary = require("../config/cloudinary");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed."));
    }

    cb(null, true);
  },
});

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "code-with-ram/article-covers",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(buffer);
  });
};

const uploadArticleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image.",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully.",
      image: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  uploadArticleImage,
};
