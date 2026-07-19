const AuthService = require("../services/auth.service");

/**
 * Authentication middleware checking for user identification via header, query, or body.
 * Attaches full user profile from DynamoDB to req.user.
 */
async function authenticate(req, res, next) {
  try {
    const userId =
      req.headers["x-user-id"] ||
      req.query.userId ||
      req.body.userId ||
      req.headers["authorization"]?.replace("Bearer ", "").trim();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing user authentication (x-user-id header or token required)",
      });
    }

    let authIdentifier = userId;
    if (authIdentifier.startsWith("admin-token-")) {
      authIdentifier = authIdentifier.replace("admin-token-", "");
    }

    // Try finding by userId first
    let user = await AuthService.getUserById(authIdentifier);
    if (!user) {
      // Fallback: try finding by firebaseUid if token passed is firebaseUid
      user = await AuthService.getUserByFirebaseUid(authIdentifier);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User account not found in database",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("[AuthMiddleware] Error authenticating user:", err);
    return res.status(500).json({
      success: false,
      message: "Authentication Server Error",
    });
  }
}

module.exports = {
  authenticate,
};
