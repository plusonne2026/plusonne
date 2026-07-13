/**
 * Role checking middleware for authorized routes
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access Forbidden: Insufficient Permissions",
      });
    }
    next();
  };
}

module.exports = {
  requireRole,
};
