const UserService = require("../services/user.service");
const { toFullProfile } = require("../dto/user.dto");

class UserController {
  /**
   * GET /api/v1/users/me
   * Get own profile (authenticated user)
   */
  static async getMe(req, res, next) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const user = await UserService.getUserById(userId);
      if (!user || user.status === "deleted") {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      return res.status(200).json({
        success: true,
        data: toFullProfile(user),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/users/me
   * Update own profile
   * Allowed fields: displayName, avatarUrl, city, coordinates, preferredLanguages
   */
  static async updateMe(req, res, next) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const updatedUser = await UserService.updateProfile(userId, req.body);

      return res.status(200).json({
        success: true,
        data: toFullProfile(updatedUser),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/users/:userId
   * Admin only — Get any user's full profile
   */
  static async getUserById(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      return res.status(200).json({
        success: true,
        data: toFullProfile(user),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/users/:userId/status
   * Admin only — Suspend / activate / delete a user
   * Body: { "status": "active" | "suspended" | "deleted" }
   */
  static async updateStatus(req, res, next) {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "status is required. Allowed: active, suspended, deleted",
        });
      }

      const updatedUser = await UserService.updateStatus(userId, status);

      return res.status(200).json({
        success: true,
        message: `User status updated to '${status}'`,
        data: toFullProfile(updatedUser),
      });
    } catch (err) {
      if (err.message?.startsWith("Invalid status")) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  /**
   * GET /api/v1/users
   * Admin only — List all users (paginated, filterable)
   * Query: ?limit=20&lastKey=<base64>&role=user|host|admin&status=active|suspended|deleted
   */
  static async listUsers(req, res, next) {
    try {
      const { limit, lastKey, role, status } = req.query;

      const result = await UserService.listUsers({ limit, lastKey, role, status });

      return res.status(200).json({
        success: true,
        data: result.users.map(toFullProfile),
        pagination: {
          count: result.count,
          nextKey: result.nextKey,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
