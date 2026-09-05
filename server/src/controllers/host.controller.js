const HostService = require("../services/host.service");
const {
  registerHostSchema,
  updateBankDetailsSchema,
  updateAvailabilitySchema,
  kycUploadSchema,
} = require("../validators/host.validator");

class HostController {
  // ─────────────────────────────────────────────
  // #1 POST /api/v1/hosts/register
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // #2 GET /api/v1/hosts/me
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // #3 PUT /api/v1/hosts/me
  // ─────────────────────────────────────────────
  static async updateProfile(req, res, next) {
    try {
      const hostId = req.user.userId;
      const payload = req.body; // { bio, categories, languages, city }

      const updated = await HostService.updateProfile(hostId, payload);

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #4 PUT /api/v1/hosts/me/availability
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // #5 PUT /api/v1/hosts/me/toggle-online
  // ─────────────────────────────────────────────
  static async toggleOnlineStatus(req, res, next) {
    try {
      const hostId = req.user.userId;

      // Get current status and toggle it, OR accept explicit value
      const { isOnline } = req.body;

      if (isOnline !== undefined && typeof isOnline !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isOnline must be a boolean",
        });
      }

      // If isOnline not passed in body → fetch current and flip
      let targetStatus = isOnline;
      if (targetStatus === undefined) {
        const profile = await HostService.getHostProfile(hostId);
        if (!profile) {
          return res.status(404).json({ success: false, message: "Host not found" });
        }
        targetStatus = !profile.isOnline;
      }

      const updated = await HostService.updateOnlineStatus(hostId, targetStatus);

      return res.status(200).json({
        success: true,
        message: `Host is now ${targetStatus ? "online" : "offline"}`,
        data: { isOnline: targetStatus, ...updated },
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #6 PUT /api/v1/hosts/me/location
  // ─────────────────────────────────────────────
  static async updateLocation(req, res, next) {
    try {
      const hostId = req.user.userId;
      const { lat, lng } = req.body;

      if (typeof lat !== "number" || typeof lng !== "number") {
        return res.status(400).json({
          success: false,
          message: "lat and lng are required and must be numbers",
        });
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          message: "Invalid coordinates range",
        });
      }

      const updated = await HostService.updateLocation(hostId, { lat, lng });

      return res.status(200).json({
        success: true,
        message: "Location updated successfully",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #7 GET /api/v1/hosts/me/earnings
  // ─────────────────────────────────────────────
  static async getEarnings(req, res, next) {
    try {
      const hostId = req.user.userId;
      const profile = await HostService.getHostProfile(hostId);

      if (!profile) {
        return res.status(404).json({ success: false, message: "Host not found" });
      }

      return res.status(200).json({
        success: true,
        data: profile.earnings || { thisMonth: 0, lastMonth: 0, total: 0, pending: 0 },
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #8 GET /api/v1/hosts/me/earnings/history
  // ─────────────────────────────────────────────
  static async getEarningsHistory(req, res, next) {
    try {
      const hostId = req.user.userId;
      const { limit = 20, lastKey } = req.query;

      const result = await HostService.getEarningsHistory(hostId, {
        limit: parseInt(limit, 10),
        lastKey,
      });

      return res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          count: result.items.length,
          lastEvaluatedKey: result.lastKey || null,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #9 POST /api/v1/hosts/me/kyc
  // ─────────────────────────────────────────────
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
        message: "KYC documents uploaded successfully. Verification is pending.",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #10 GET /api/v1/hosts/:hostId  (public profile)
  // ─────────────────────────────────────────────
  static async getHostById(req, res, next) {
    try {
      const { hostId } = req.params;
      const profile = await HostService.getHostProfile(hostId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Host not found",
        });
      }

      // Return only public fields (strip sensitive info)
      const publicProfile = {
        hostId: profile.hostId,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        categories: profile.categories,
        languages: profile.languages,
        city: profile.city,
        rating: profile.rating,
        totalReviews: profile.totalReviews,
        totalCompletions: profile.totalCompletions,
        completionRate: profile.completionRate,
        experienceYears: profile.experienceYears,
        isOnline: profile.isOnline,
        kycStatus: profile.kycStatus,
        hostTrustScore: profile.hostTrustScore,
        createdAt: profile.createdAt,
      };

      return res.status(200).json({
        success: true,
        data: publicProfile,
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #11 GET /api/v1/hosts  (search / filter)
  // ─────────────────────────────────────────────
  static async searchHosts(req, res, next) {
    try {
      const {
        city,
        category,
        minRating,
        isOnline,
        language,
        limit = 20,
        lastKey,
      } = req.query;

      const filters = {
        city,
        category,
        minRating: minRating ? parseFloat(minRating) : undefined,
        isOnline: isOnline !== undefined ? isOnline === "true" : undefined,
        language,
        limit: parseInt(limit, 10),
        lastKey,
      };

      const result = await HostService.searchHosts(filters);

      return res.status(200).json({
        success: true,
        count: result.items.length,
        data: result.items,
        meta: {
          lastEvaluatedKey: result.lastKey || null,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #12 GET /api/v1/hosts/nearby
  // ─────────────────────────────────────────────
  static async getNearbyHosts(req, res, next) {
    try {
      const { lat, lng, radiusKm = 10, categoryId, minRating, limit = 20 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: "lat and lng query parameters are required",
        });
      }

      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);

      if (isNaN(parsedLat) || isNaN(parsedLng)) {
        return res.status(400).json({
          success: false,
          message: "lat and lng must be valid numbers",
        });
      }

      const hosts = await HostService.getNearbyHosts({
        lat: parsedLat,
        lng: parsedLng,
        radiusKm: parseFloat(radiusKm),
        categoryId,
        minRating: minRating ? parseFloat(minRating) : undefined,
        limit: parseInt(limit, 10),
      });

      return res.status(200).json({
        success: true,
        count: hosts.length,
        data: hosts,
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #13 PUT /api/v1/hosts/:hostId/kyc-status  (admin)
  // ─────────────────────────────────────────────
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

      if (kycStatus === "rejected" && !rejectionReason) {
        return res.status(400).json({
          success: false,
          message: "rejectionReason is required when kycStatus is 'rejected'",
        });
      }

      const updated = await HostService.updateKycStatus(hostId, kycStatus, rejectionReason);

      return res.status(200).json({
        success: true,
        message: `KYC status updated to '${kycStatus}'`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #14 GET /api/v1/hosts/pending-kyc  (admin)
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // LEGACY / EXTRA — GET /api/v1/hosts/active
  // ─────────────────────────────────────────────
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
