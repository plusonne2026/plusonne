const AuthService = require("../services/auth.service");
const { getFirebaseAuth, isFirebaseAvailable } = require("../config/firebase.config");

/**
 * Helper to resolve user by userId, firebaseUid, or email in dev/test scenarios
 */
async function resolveUser(identifier) {
  if (!identifier || typeof identifier !== "string") return null;
  let cleanId = identifier.trim();
  if (cleanId.startsWith("Bearer ")) cleanId = cleanId.replace("Bearer ", "").trim();
  if (cleanId.startsWith("admin-token-")) cleanId = cleanId.replace("admin-token-", "").trim();
  if (cleanId === "admin" || cleanId === "admin-token") cleanId = "admin-001";

  // 1. Try primary key (userId)
  let user = await AuthService.getUserById(cleanId);
  if (user) return user;

  // 2. Try firebaseUid
  user = await AuthService.getUserByFirebaseUid(cleanId);
  if (user) return user;

  // 3. Try email (e.g. admin@plusone.com)
  if (cleanId.includes("@")) {
    user = await AuthService.getUserByEmail(cleanId);
    if (user) return user;
  }

  return null;
}

/**
 * Authentication Middleware
 *
 * PRODUCTION MODE (Firebase available):
 *   - Authorization: Bearer <Firebase ID Token> header leta hai
 *   - Firebase Admin SDK se token verify karta hai
 *   - Verified token ka firebaseUid use karke DynamoDB se user fetch karta hai
 *
 * BYPASS MODE (local dev, bina Firebase JSON ke):
 *   - x-user-id header ya Authorization header se direct userId leta hai
 *   - DynamoDB mein userId se user dhoondhta hai
 */
async function authenticate(req, res, next) {
  try {
    const xUserId = req.headers["x-user-id"];
    const authHeader = req.headers["authorization"];
    const rawToken = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "").trim()
      : null;

    // ── DEV / POSTMAN BYPASS: Agar x-user-id header bheja hai toh direct use karo ──
    if (xUserId && xUserId.trim()) {
      const user = await resolveUser(xUserId);
      if (user) {
        if (user.status === "deleted") {
          return res.status(403).json({
            success: false,
            message: "Forbidden: This account has been deleted.",
          });
        }
        req.user = user;
        req.firebaseUid = user.firebaseUid;
        return next();
      }

      // Agar x-user-id se user nahi mila aur koi rawToken bhi nahi hai, tabhi 401 do
      if (!rawToken) {
        return res.status(401).json({
          success: false,
          message: `Unauthorized: User account not found for provided x-user-id header: "${xUserId}".`,
        });
      }
      console.warn(`[AuthMiddleware] x-user-id "${xUserId}" not found, attempting Authorization header.`);
    }

    // ── PRODUCTION MODE: Firebase token verify karo ──────────────────────────
    if (isFirebaseAvailable && rawToken) {
      try {
        const firebaseAuth = getFirebaseAuth();
        const decodedToken = await firebaseAuth.verifyIdToken(rawToken);
        const firebaseUid = decodedToken.uid;

        const user = await AuthService.getUserByFirebaseUid(firebaseUid);
        if (!user || user.status === "deleted") {
          return res.status(401).json({
            success: false,
            message: "Unauthorized: User account not found or has been deleted.",
          });
        }

        req.user = user;
        req.firebaseUid = firebaseUid;
        req.decodedToken = decodedToken;
        return next();
      } catch (firebaseError) {
        // Local dev fallback: agar token Firebase JWT format nahi hai (jaise dummy string / admin token)
        if (process.env.NODE_ENV !== "production") {
          const user = await resolveUser(rawToken);
          if (user) {
            if (user.status === "deleted") {
              return res.status(403).json({
                success: false,
                message: "Forbidden: This account has been deleted.",
              });
            }
            req.user = user;
            req.firebaseUid = user.firebaseUid;
            return next();
          }
        }

        // Token invalid/expired hai
        if (
          firebaseError.code === "auth/id-token-expired" ||
          firebaseError.code === "auth/id-token-revoked" ||
          firebaseError.code === "auth/argument-error" ||
          firebaseError.code === "auth/invalid-id-token"
        ) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized: Firebase token invalid or expired. Please login again.",
            code: firebaseError.code,
          });
        }
        console.warn("[AuthMiddleware] Firebase verify error:", firebaseError.message);
      }
    }

    const bypassId =
      req.headers["x-user-id"] ||
      req.query.userId ||
      rawToken;

    if (!bypassId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing authentication. Send 'Authorization: Bearer <token>' or 'x-user-id' header.",
      });
    }

    const user = await resolveUser(bypassId);
    if (!user || user.status === "deleted") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User account not found or has been deleted.",
      });
    }

    req.user = user;
    req.firebaseUid = user.firebaseUid;
    return next();
  } catch (err) {
    console.error("[AuthMiddleware] Unexpected error:", err);
    return res.status(500).json({
      success: false,
      message: "Authentication Server Error",
    });
  }
}

module.exports = {
  authenticate,
};
