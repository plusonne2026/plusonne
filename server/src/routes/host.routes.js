const express = require("express");
const HostController = require("../controllers/host.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { ROLES } = require("../config/constants");

const router = express.Router();

// ─────────────────────────────────────────────
// PUBLIC / SEARCH ROUTES (before /:hostId to avoid param conflict)
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/hosts
 * @desc    Search / filter all verified hosts
 * @access  Authenticated (any role)
 */
router.get("/", authenticate, HostController.searchHosts);

/**
 * @route   GET /api/v1/hosts/nearby
 * @desc    Find nearby available hosts by geolocation
 * @access  Authenticated (user)
 */
router.get("/nearby", authenticate, HostController.getNearbyHosts);

/**
 * @route   GET /api/v1/hosts/pending-kyc
 * @desc    List all pending KYC applications
 * @access  Authenticated (admin)
 */
router.get("/pending-kyc", authenticate, requireRole(ROLES.ADMIN), HostController.getPendingKyc);

/**
 * @route   GET /api/v1/hosts/active
 * @desc    Get all active and verified hosts
 * @access  Public
 */
router.get("/active", HostController.getActiveHosts);

// ─────────────────────────────────────────────
// HOST REGISTRATION
// ─────────────────────────────────────────────

/**
 * @route   POST /api/v1/hosts/register
 * @desc    Apply to become a host
 * @access  Authenticated (user)
 */
router.post("/register", authenticate, HostController.register);

// ─────────────────────────────────────────────
// HOST SELF (me) ROUTES
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/hosts/me
 * @desc    Get own host profile
 * @access  Authenticated (host)
 */
router.get("/me", authenticate, requireRole(ROLES.HOST), HostController.getProfile);

/**
 * @route   PUT /api/v1/hosts/me
 * @desc    Update host profile (bio, categories, languages, city)
 * @access  Authenticated (host)
 */
router.put("/me", authenticate, requireRole(ROLES.HOST), HostController.updateProfile);

/**
 * @route   PUT /api/v1/hosts/me/availability
 * @desc    Set weekly availability schedule
 * @access  Authenticated (host)
 */
router.put("/me/availability", authenticate, requireRole(ROLES.HOST), HostController.updateAvailability);

/**
 * @route   PUT /api/v1/hosts/me/toggle-online
 * @desc    Go online / offline
 * @access  Authenticated (host)
 */
router.put("/me/toggle-online", authenticate, requireRole(ROLES.HOST), HostController.toggleOnlineStatus);

/**
 * @route   PUT /api/v1/hosts/me/location
 * @desc    Update current GPS location
 * @access  Authenticated (host)
 */
router.put("/me/location", authenticate, requireRole(ROLES.HOST), HostController.updateLocation);

/**
 * @route   GET /api/v1/hosts/me/earnings
 * @desc    Get earnings summary
 * @access  Authenticated (host)
 */
router.get("/me/earnings", authenticate, requireRole(ROLES.HOST), HostController.getEarnings);

/**
 * @route   GET /api/v1/hosts/me/earnings/history
 * @desc    Get payout history (paginated)
 * @access  Authenticated (host)
 */
router.get("/me/earnings/history", authenticate, requireRole(ROLES.HOST), HostController.getEarningsHistory);

/**
 * @route   POST /api/v1/hosts/me/kyc
 * @desc    Upload KYC documents
 * @access  Authenticated (host)
 */
router.post("/me/kyc", authenticate, requireRole(ROLES.HOST), HostController.uploadKYC);

// ─────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────

/**
 * @route   PUT /api/v1/hosts/:hostId/kyc-status
 * @desc    Approve or reject KYC verification
 * @access  Authenticated (admin)
 */
router.put("/:hostId/kyc-status", authenticate, requireRole(ROLES.ADMIN), HostController.updateKycStatus);

// ─────────────────────────────────────────────
// PUBLIC HOST PROFILE (must be LAST — dynamic param)
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/hosts/:hostId
 * @desc    Get host public profile
 * @access  Authenticated (any)
 */
router.get("/:hostId", authenticate, HostController.getHostById);

module.exports = router;
