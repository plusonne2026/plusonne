const express = require("express");
const AdminController = require("../controllers/admin.controller");
const AdminPlanController = require("../controllers/admin.plan.controller");
const AdminUnitController = require("../controllers/admin.unit.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { ROLES } = require("../config/constants");

const router = express.Router();

// All admin routes require authentication + admin role check
router.use(authenticate, requireRole(ROLES.ADMIN));

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get comprehensive dashboard statistics
 */
router.get("/stats", AdminController.getStats);

/**
 * @route   GET /api/v1/admin/users
 * @desc    List all platform users
 */
router.get("/users", AdminController.getUsers);

/**
 * @route   GET /api/v1/admin/hosts
 * @desc    List all host profiles joined with user data
 */
router.get("/hosts", AdminController.getHosts);

/**
 * @route   PUT /api/v1/admin/users/:userId/status
 * @desc    Update user status (active / suspended / deleted)
 */
router.put("/users/:userId/status", AdminController.updateStatus);

/**
 * @route   PUT /api/v1/admin/users/:userId/role
 * @desc    Update user role (user / host / admin)
 */
router.put("/users/:userId/role", AdminController.updateRole);

/**
 * @route   PUT /api/v1/admin/hosts/:hostId/kyc-status
 * @desc    Approve or reject host KYC verification
 */
router.put("/hosts/:hostId/kyc-status", AdminController.updateHostKyc);

// ================= PLANS ================= //

/**
 * @route   POST /api/v1/admin/plans
 */
router.post("/plans", AdminPlanController.createPlan);

/**
 * @route   GET /api/v1/admin/plans
 */
router.get("/plans", AdminPlanController.getPlans);

/**
 * @route   PUT /api/v1/admin/plans/:planId/status
 */
router.put("/plans/:planId/status", AdminPlanController.updatePlanStatus);


// ================= UNITS & SETTINGS ================= //

/**
 * @route   GET /api/v1/admin/settings/units
 */
router.get("/settings/units", AdminUnitController.getUnitPrices);

/**
 * @route   PUT /api/v1/admin/settings/units
 */
router.put("/settings/units", AdminUnitController.updateUnitPrices);

/**
 * @route   GET /api/v1/admin/users/:userId/balance
 */
router.get("/users/:userId/balance", AdminUnitController.getUserBalance);

/**
 * @route   POST /api/v1/admin/users/:userId/credit-units
 */
router.post("/users/:userId/credit-units", AdminUnitController.creditUserUnits);

// ================= GPS & SOS ================= //

/**
 * @route   GET /api/v1/admin/sessions/active
 * @desc    Get all active sessions for global GPS monitoring
 */
router.get("/sessions/active", AdminController.getActiveSessions);

// ================= FINANCE ================= //

/**
 * @route   GET /api/v1/admin/finance/payouts
 * @desc    Get all pending payouts
 */
router.get("/finance/payouts", AdminController.getPendingPayouts);

/**
 * @route   POST /api/v1/admin/finance/payouts/:bookingId/process
 * @desc    Process payout for a booking
 */
router.post("/finance/payouts/:bookingId/process", AdminController.processPayout);

module.exports = router;
