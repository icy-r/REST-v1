const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Check if user is an admin
exports.isAdmin = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied - Admin authorization required",
    });
  }
};

// Check if user is the resource owner
exports.isResourceOwner = (Model) => async (req, res, next) => {
  try {
    const resource = await Model.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    // Check if user owns resource or is admin
    if (
      (resource.userId && resource.userId.toString() === req.user.id) ||
      req.user.role === "admin"
    ) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied - Not authorized to access this resource",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
