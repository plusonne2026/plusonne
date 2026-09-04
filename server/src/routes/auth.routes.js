const express = require("express");
const AuthController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register or login user from unified Auth flow
 * @access  Public
 */
router.post("/register", AuthController.register);

/**
 * @route   POST /api/v1/auth/verify-token
 * @desc    Verify Firebase token and return user session
 * @access  Public
 */
router.post("/verify-token", AuthController.verifyToken);

/**
 * @route   POST /api/v1/auth/complete-profile
 * @desc    Complete profile after social login (phone, city, etc.)
 * @access  Authenticated
 */
router.post("/complete-profile", authenticate, AuthController.completeProfile);

/**
 * @route   DELETE /api/v1/auth/delete-account
 * @desc    Delete user account (soft delete)
 * @access  Authenticated
 */
router.delete("/delete-account", authenticate, AuthController.deleteAccount);

/**
 * @route   POST /api/v1/auth/admin-login
 * @desc    Direct backend verification for admin accounts
 * @access  Public
 */
router.post("/admin-login", AuthController.adminLogin);

module.exports = router;
