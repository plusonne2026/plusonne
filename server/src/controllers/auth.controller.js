const AuthService = require("../services/auth.service");
const { registerSchema, verifyTokenSchema } = require("../validators/auth.validator");

class AuthController {
  /**
   * POST /api/v1/auth/register
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

      const { user, isNewUser } = await AuthService.registerUser(value);

      return res.status(isNewUser ? 201 : 200).json({
        success: true,
        isNewUser,
        data: {
          userId: user.userId,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          isVerified: user.isVerified,
          trustScore: user.trustScore,
          city: user.city,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/verify-token
   */
  static async verifyToken(req, res, next) {
    try {
      const { error, value } = verifyTokenSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          error: error.details[0].message,
        });
      }

      const user = await AuthService.verifyLoginToken(value.firebaseUid);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found. Please register first.",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          userId: user.userId,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          isVerified: user.isVerified,
          trustScore: user.trustScore,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  static async getProfile(req, res, next) {
    try {
      const userId = req.query.userId || req.headers["x-user-id"];
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required",
        });
      }

      const user = await AuthService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
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
        data: user,
        token: `admin-token-${user.userId}`,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
