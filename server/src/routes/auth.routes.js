const express = require("express");
const AuthController = require("../controllers/auth.controller");

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
 * @route   GET /api/v1/auth/me
 * @desc    Get logged in user profile
 * @access  Public / Authenticated
 */
router.get("/me", AuthController.getProfile);

/**
 * @route   POST /api/v1/auth/admin-login
 * @desc    Direct backend verification for admin accounts
 * @access  Public
 */
router.post("/admin-login", AuthController.adminLogin);

module.exports = router;
