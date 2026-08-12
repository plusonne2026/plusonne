const express = require("express");
const HostController = require("../controllers/host.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { ROLES } = require("../config/constants");

const router = express.Router();

/**
 * @route   POST /api/v1/hosts/register
 * @desc    Submit host application & promote user role to host
 * @access  Authenticated (User/Host)
 */
router.post("/register", authenticate, HostController.register);

/**
 * @route   GET /api/v1/hosts/active
 * @desc    Get all active and verified hosts
 * @access  Public
 */
router.get("/active", HostController.getActiveHosts);

/**
 * @route   GET /api/v1/hosts/me
 * @desc    Get current host profile details
 * @access  Authenticated Host
 */
router.get("/me", authenticate, requireRole(ROLES.HOST), HostController.getProfile);

/**
 * @route   PUT /api/v1/hosts/me/profile
 * @desc    Update basic profile info (bio, categories, languages, city)
 * @access  Authenticated Host
 */
router.put("/profile", authenticate, requireRole(ROLES.HOST), HostController.updateProfile);
router.put("/me/profile", authenticate, requireRole(ROLES.HOST), HostController.updateProfile);

/**
 * @route   GET /api/v1/hosts/me/earnings
 * @desc    Get earnings and payout history
 * @access  Authenticated Host
 */
router.get("/earnings", authenticate, requireRole(ROLES.HOST), HostController.getEarnings);
router.get("/me/earnings", authenticate, requireRole(ROLES.HOST), HostController.getEarnings);

/**
 * @route   PUT /api/v1/hosts/me/bank-details
 * @desc    Add or update bank account info post-onboarding
 * @access  Authenticated Host
 */
router.put("/bank-details", authenticate, requireRole(ROLES.HOST), HostController.updateBankDetails);
router.put("/me/bank-details", authenticate, requireRole(ROLES.HOST), HostController.updateBankDetails);

/**
 * @route   PUT /api/v1/hosts/me/availability
 * @desc    Update host weekly availability schedule
 * @access  Authenticated Host
 */
router.put("/availability", authenticate, requireRole(ROLES.HOST), HostController.updateAvailability);
router.put("/me/availability", authenticate, requireRole(ROLES.HOST), HostController.updateAvailability);

/**
 * @route   PUT /api/v1/hosts/me/status
 * @desc    Toggle online/offline status
 * @access  Authenticated Host
 */
router.put("/me/status", authenticate, requireRole(ROLES.HOST), HostController.updateOnlineStatus);

/**
 * @route   POST /api/v1/hosts/me/kyc
 * @desc    Upload or update KYC documents
 * @access  Authenticated Host
 */
router.post("/kyc", authenticate, requireRole(ROLES.HOST), HostController.uploadKYC);
router.post("/me/kyc", authenticate, requireRole(ROLES.HOST), HostController.uploadKYC);

/**
 * @route   GET /api/v1/hosts/pending-kyc
 * @desc    List all pending KYC applications (Admin)
 * @access  Authenticated (Admin / Dev)
 */
router.get("/pending-kyc", authenticate, HostController.getPendingKyc);

/**
 * @route   PUT /api/v1/hosts/:hostId/kyc-status
 * @desc    Approve or reject KYC verification status
 * @access  Authenticated (Admin / Dev)
 */
router.put("/:hostId/kyc-status", authenticate, HostController.updateKycStatus);

module.exports = router;
