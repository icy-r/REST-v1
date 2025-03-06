const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Access denied: Admin privileges required" });
};

const isResourceOwner = (model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resource = await model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      // Allow admins full access
      if (req.user.role === "admin") {
        return next();
      }

      // Check if regular user owns the resource
      if (resource.userId && resource.userId.toString() === req.user.id) {
        return next();
      }

      return res
        .status(403)
        .json({ message: "Access denied: You do not own this resource" });
    } catch (error) {
      return res.status(500).json({
        message: "Error validating resource ownership",
        error: error.message,
      });
    }
  };
};

module.exports = {
  isAdmin,
  isResourceOwner,
};
