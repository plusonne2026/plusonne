const AuthService = require("../services/auth.service");
const { getFirebaseAuth, isFirebaseAvailable } = require("../config/firebase.config");
const { registerSchema } = require("../validators/auth.validator");
const { toSessionProfile, toFullProfile } = require("../dto/user.dto");

class AuthController {
  /**
   * POST /api/v1/auth/register
   *
   * Flow:
   * 1. idToken lo (ya bypass mode mein firebaseUid)
   * 2. Firebase se token verify karo → uid, email, phone nikalo
   * 3. User create ya update karo DynamoDB mein
   */
  static async register(req, res, next) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          error: error.details[0].message,
        });
      }

      let verifiedPayload = { ...value };

      // ── PRODUCTION MODE: Firebase ID Token verify karo ──────────────────
      if (isFirebaseAvailable && value.idToken) {
        try {
          const firebaseAuth = getFirebaseAuth();
          const decodedToken = await firebaseAuth.verifyIdToken(value.idToken);

          // Token se verified data lo — frontend ke data par trust mat karo
          verifiedPayload.firebaseUid = decodedToken.uid;
          verifiedPayload.email       = decodedToken.email         || value.email || null;
          verifiedPayload.phone       = decodedToken.phone_number  || value.phone || null;
          verifiedPayload.isVerified  = decodedToken.email_verified || false;

          if (!verifiedPayload.avatarUrl && decodedToken.picture) {
            verifiedPayload.avatarUrl = decodedToken.picture;
          }

          delete verifiedPayload.idToken;
          console.log(`[AuthController] ✅ Token verified for uid: ${decodedToken.uid}`);
        } catch (firebaseError) {
          return res.status(401).json({
            success: false,
            message: "Invalid or expired Firebase ID Token.",
            code: firebaseError.code,
          });
        }
      } else if (value.firebaseUid) {
        // ── DEV / POSTMAN BYPASS MODE ──────────────────────────────────────
        console.warn(`[AuthController] ⚠️  DEV BYPASS: uid=${value.firebaseUid}`);
        delete verifiedPayload.idToken;
      } else {
        return res.status(400).json({
          success: false,
          message: "Either idToken or firebaseUid is required.",
        });
      }

      const { user, isNewUser } = await AuthService.registerUser(verifiedPayload);

      return res.status(isNewUser ? 201 : 200).json({
        success: true,
        isNewUser,
        data: toSessionProfile(user),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/verify-token
   *
   * Flow:
   * 1. idToken verify karo ya firebaseUid se user dhoundho (bypass)
   * 2. User return karo
   */
  static async verifyToken(req, res, next) {
    try {
      // Header se Bearer token bhi accept karo
      const authHeader  = req.headers["authorization"];
      const headerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.replace("Bearer ", "").trim()
        : null;

      const bodyToken = req.body?.idToken || headerToken;
      const firebaseUid = req.body?.firebaseUid || req.headers["x-user-id"];

      let firebaseUidToLookup = firebaseUid;

      // PRODUCTION: idToken verify karo (body ya header se)
      if (isFirebaseAvailable && bodyToken) {
        try {
          const firebaseAuth = getFirebaseAuth();
          const decodedToken = await firebaseAuth.verifyIdToken(bodyToken);
          firebaseUidToLookup = decodedToken.uid;
        } catch (firebaseError) {
          // Local dev fallback: agar direct non-JWT uid pass kiya ho
          if (process.env.NODE_ENV !== "production" && !firebaseUidToLookup) {
            firebaseUidToLookup = bodyToken;
          } else {
            return res.status(401).json({
              success: false,
              message: "Invalid or expired Firebase ID Token.",
              code: firebaseError.code,
            });
          }
        }
      }

      if (!firebaseUidToLookup) {
        return res.status(400).json({
          success: false,
          message: "idToken or firebaseUid is required.",
        });
      }

      const user = await AuthService.verifyLoginToken(firebaseUidToLookup);
      if (!user || user.status === "deleted") {
        return res.status(404).json({
          success: false,
          message: "User account not found or has been deleted.",
        });
      }

      return res.status(200).json({
        success: true,
        data: toSessionProfile(user),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/admin-login
   */
  static async adminLogin(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required for admin login",
        });
      }

      const user = await AuthService.adminLogin(email, password);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials or unauthorized role",
        });
      }

      return res.status(200).json({
        success: true,
        data: toFullProfile(user),
        token: `admin-token-${user.userId}`,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/complete-profile
   */
  static async completeProfile(req, res, next) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User identification missing",
        });
      }

      const updatedUser = await AuthService.completeProfile(userId, req.body);
      return res.status(200).json({
        success: true,
        message: "Profile completed successfully",
        data: toFullProfile(updatedUser),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/auth/delete-account
   */
  static async deleteAccount(req, res, next) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User identification missing",
        });
      }

      await AuthService.deleteAccount(userId);
      return res.status(200).json({
        success: true,
        message: "User account deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
