const express = require("express");
const UserController = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/users/me
 * @desc    Get own profile
 * @access  Authenticated (any role)
 */
router.get("/me", UserController.getMe);

/**
 * @route   PUT /api/v1/users/me
 * @desc    Update own profile (displayName, avatarUrl, city, coordinates, preferredLanguages)
 * @access  Authenticated (any role)
 */
router.put("/me", UserController.updateMe);

/**
 * @route   GET /api/v1/users
 * @desc    List all users — paginated & filterable
 * @access  Admin only
 * @query   limit, lastKey, role, status
 */
router.get("/", requireRole("admin"), UserController.listUsers);

/**
 * @route   GET /api/v1/users/:userId
 * @desc    Get any user's full profile
 * @access  Admin only
 */
router.get("/:userId", requireRole("admin"), UserController.getUserById);

/**
 * @route   PUT /api/v1/users/:userId/status
 * @desc    Suspend / activate / delete a user account
 * @access  Admin only
 * @body    { "status": "active" | "suspended" | "deleted" }
 */
router.put("/:userId/status", requireRole("admin"), UserController.updateStatus);

module.exports = router;
