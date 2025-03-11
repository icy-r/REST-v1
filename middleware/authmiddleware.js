const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require("mongoose");

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied - Admin only",
    });
  }
};

// Middleware to check if user owns the resource or is admin
exports.isResourceOwner = (model) => {
  return async (req, res, next) => {
    try {
      // Check if the id is a valid ObjectId before querying
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(); // Let the controller handle invalid ObjectIds
      }

      const resource = await model.findById(req.params.id);

      if (!resource) {
        return next(); // Let the controller handle "not found" cases
      }

      if (
        (resource.userId && resource.userId.toString() === req.user.id) ||
        req.user.role === "admin"
      ) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    } catch (error) {
      if (error.name === "CastError") {
        return next(); // Let the controller handle CastErrors
      }
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  };
};
