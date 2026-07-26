const HostService = require("../services/host.service");
const {
  registerHostSchema,
  updateBankDetailsSchema,
  updateAvailabilitySchema,
  kycUploadSchema,
} = require("../validators/host.validator");

class HostController {
  /**
   * POST /api/v1/hosts/register
   */
  static async register(req, res, next) {
    try {
      const payload = {
        userId: req.user.userId,
        ...req.body,
      };

      const { error, value } = registerHostSchema.validate(payload);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          error: error.details[0].message,
        });
      }

      const hostProfile = await HostService.registerHost(value);

      return res.status(201).json({
        success: true,
        message: "Host application submitted successfully",
        data: hostProfile,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/hosts/me
   */
  static async getProfile(req, res, next) {
    try {
      const hostId = req.user.userId;
      const hostProfile = await HostService.getHostProfile(hostId);

      if (!hostProfile) {
        return res.status(404).json({
          success: false,
          message: "Host profile not found. Please submit registration first.",
        });
      }

      return res.status(200).json({
        success: true,
        data: hostProfile,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/hosts/me/bank-details
   */
  static async updateBankDetails(req, res, next) {
    try {
      const { error, value } = updateBankDetailsSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          error: error.details[0].message,
        });
      }

      const hostId = req.user.userId;
      const updated = await HostService.updateBankDetails(hostId, value);

      return res.status(200).json({
        success: true,
        message: "Bank account details updated successfully",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/hosts/me/availability
   */
  static async updateAvailability(req, res, next) {
    try {
      const { error, value } = updateAvailabilitySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          error: error.details[0].message,
        });
      }

      const hostId = req.user.userId;
      const updated = await HostService.updateAvailability(hostId, value.schedule);

      return res.status(200).json({
        success: true,
        message: "Availability schedule updated successfully",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/hosts/me/kyc
   */
  static async uploadKYC(req, res, next) {
    try {
      const { error, value } = kycUploadSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          error: error.details[0].message,
        });
      }

      const hostId = req.user.userId;
      const updated = await HostService.uploadKYC(hostId, value);

      return res.status(200).json({
        success: true,
        message: "KYC documents uploaded successfully",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/hosts/:hostId/kyc-status
   */
  static async updateKycStatus(req, res, next) {
    try {
      const { hostId } = req.params;
      const { kycStatus, rejectionReason } = req.body;

      if (!["verified", "rejected", "pending"].includes(kycStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid kycStatus. Must be 'verified', 'rejected', or 'pending'.",
        });
      }

      const updated = await HostService.updateKycStatus(hostId, kycStatus, rejectionReason);

      return res.status(200).json({
        success: true,
        message: `KYC status updated to ${kycStatus}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/hosts/pending-kyc
   */
  static async getPendingKyc(req, res, next) {
    try {
      const pendingHosts = await HostService.getPendingKycApplications();
      return res.status(200).json({
        success: true,
        count: pendingHosts.length,
        data: pendingHosts,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/hosts/active
   */
  static async getActiveHosts(req, res, next) {
    try {
      const activeHosts = await HostService.getActiveHosts();
      return res.status(200).json({
        success: true,
        count: activeHosts.length,
        data: activeHosts,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = HostController;
