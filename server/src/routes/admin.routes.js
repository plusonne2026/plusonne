const express = require("express");
const AdminController = require("../controllers/admin.controller");
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

module.exports = router;
