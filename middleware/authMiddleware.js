const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

const contributorOnly = (req, res, next) => {
  console.log("User role:", req.user.role); // Log the user role for debugging
  if (!req.user || req.user.role !== "contributor") {
    return res.status(403).json({
      success: false,
      message: "Contributor access required",
    });
  }

  next();
};

const adminOrContributor = (req, res, next) => {
  if (!req.user || !["admin", "contributor"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Admin or contributor access required",
    });
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
  contributorOnly,
  adminOrContributor,
};

