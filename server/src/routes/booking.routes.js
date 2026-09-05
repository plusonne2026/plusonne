const express = require("express");
const BookingController = require("../controllers/booking.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { ROLES } = require("../config/constants");

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

// ─────────────────────────────────────────────
// STATIC ROUTES  (must be before /:bookingId)
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/bookings
 * @desc    Admin — List all bookings (paginated, filterable)
 * @access  Authenticated (admin)
 */
router.get("/", requireRole(ROLES.ADMIN), BookingController.getAllBookings);

/**
 * @route   GET /api/v1/bookings/my
 * @desc    User — Get own bookings
 * @access  Authenticated (user)
 */
router.get("/my", BookingController.getMyBookings);

/**
 * @route   GET /api/v1/bookings/host/my
 * @desc    Host — Get own bookings
 * @access  Authenticated (host)
 */
router.get("/host/my", requireRole(ROLES.HOST), BookingController.getHostMyBookings);

// ─────────────────────────────────────────────
// CREATE BOOKING
// ─────────────────────────────────────────────

/**
 * @route   POST /api/v1/bookings
 * @desc    Create a new booking
 * @access  Authenticated (user)
 */
router.post("/", BookingController.createBooking);

// ─────────────────────────────────────────────
// DYNAMIC ROUTES  /:bookingId
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/bookings/:bookingId
 * @desc    Get booking details (user, host, or admin involved)
 * @access  Authenticated (any)
 */
router.get("/:bookingId", BookingController.getBookingById);

/**
 * @route   PUT /api/v1/bookings/:bookingId/cancel
 * @desc    Cancel a booking
 * @access  Authenticated (user or host)
 */
router.put("/:bookingId/cancel", BookingController.cancelBooking);

/**
 * @route   PUT /api/v1/bookings/:bookingId/host-response
 * @desc    Host accepts or rejects a booking
 * @access  Authenticated (host)
 */
router.put("/:bookingId/host-response", requireRole(ROLES.HOST), BookingController.hostResponse);

/**
 * @route   PUT /api/v1/bookings/:bookingId/swap-host
 * @desc    User requests a different host
 * @access  Authenticated (user)
 */
router.put("/:bookingId/swap-host", BookingController.swapHost);

module.exports = router;
