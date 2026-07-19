const AdminService = require("../services/admin.service");
const HostService = require("../services/host.service");

class AdminController {
  /**
   * GET /api/v1/admin/stats
   */
  static async getStats(req, res, next) {
    try {
      const stats = await AdminService.getPlatformStats();
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/users
   */
  static async getUsers(req, res, next) {
    try {
      const users = await AdminService.getAllUsers();
      return res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/hosts
   */
  static async getHosts(req, res, next) {
    try {
      const hosts = await AdminService.getAllHosts();
      return res.status(200).json({
        success: true,
        count: hosts.length,
        data: hosts,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/admin/users/:userId/status
   */
  static async updateStatus(req, res, next) {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      if (!["active", "suspended", "deleted"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be active, suspended, or deleted.",
        });
      }

      const updated = await AdminService.updateUserStatus(userId, status);
      return res.status(200).json({
        success: true,
        message: `User status updated to ${status}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/admin/users/:userId/role
   */
  static async updateRole(req, res, next) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!["user", "host", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Must be user, host, or admin.",
        });
      }

      const updated = await AdminService.updateUserRole(userId, role);
      return res.status(200).json({
        success: true,
        message: `User role updated to ${role}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/admin/hosts/:hostId/kyc-status
   */
  static async updateHostKyc(req, res, next) {
    try {
      const { hostId } = req.params;
      const { kycStatus, rejectionReason } = req.body;

      if (!["verified", "rejected", "pending"].includes(kycStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid kycStatus. Must be verified, rejected, or pending.",
        });
      }

      const updated = await HostService.updateKycStatus(hostId, kycStatus, rejectionReason);
      return res.status(200).json({
        success: true,
        message: `Host KYC status updated to ${kycStatus}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminController;
