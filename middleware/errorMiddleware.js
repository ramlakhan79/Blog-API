const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  /*
  |--------------------------------------------------------------------------
  | Invalid MongoDB ObjectId
  |--------------------------------------------------------------------------
  */

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid article ID",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Duplicate MongoDB field
  |--------------------------------------------------------------------------
  */

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate value already exists",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Mongoose Validation Error
  |--------------------------------------------------------------------------
  */

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((error) => error.message);

    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Default Error
  |--------------------------------------------------------------------------
  */

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = errorMiddleware;
