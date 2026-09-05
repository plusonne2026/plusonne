const { v4: uuidv4 } = require("uuid");

/**
 * Booking Status Enum (matches backend_documentation.md Table 9)
 *
 * pending_payment → pending_assignment → host_assigned → host_confirmed →
 * active → completed → rated
 *              ↘ cancelled
 *              ↘ disputed
 */
const BOOKING_STATUSES = [
  "pending_payment",
  "pending_assignment",
  "host_assigned",
  "host_confirmed",
  "active",
  "completed",
  "rated",
  "cancelled",
  "disputed",
];

/**
 * Creates a normalized PlusOne_Bookings table document
 * matching Table 9 specs in backend_documentation.md
 *
 * @param {Object} payload
 * @returns {Object} DynamoDB-ready booking item
 */
function formatBookingModel(payload) {
  const now = new Date().toISOString();

  return {
    // ── Primary Key ───────────────────────────────
    bookingId: payload.bookingId || uuidv4(),

    // ── Participants ──────────────────────────────
    userId: payload.userId,                          // Customer
    hostId: payload.hostId || null,                  // null until assigned

    // ── Package & Category ────────────────────────
    packageId: payload.packageId || null,            // null if unit-based
    categoryId: payload.categoryId,

    // ── Pricing ───────────────────────────────────
    pricingModel: payload.pricingModel,              // subscription | unit | package

    // ── Status ───────────────────────────────────
    status: payload.status || "pending_payment",

    // ── Schedule ──────────────────────────────────
    scheduledDate: payload.scheduledDate,            // YYYY-MM-DD
    scheduledTime: payload.scheduledTime,            // HH:mm

    // ── Location ─────────────────────────────────
    pickupLocation: payload.pickupLocation || {
      lat: null,
      lng: null,
      address: "",
      geohash6: "",
    },

    // ── Extra Details ─────────────────────────────
    specialInstructions: payload.specialInstructions || null,
    preferredHostId: payload.preferredHostId || null,

    // ── Price Map ─────────────────────────────────
    price: payload.price || {
      base: 0,
      extras: 0,
      overage: 0,
      discount: 0,
      tax: 0,
      total: 0,
      currency: "INR",
    },

    // ── Razorpay ──────────────────────────────────
    razorpayOrderId: payload.razorpayOrderId || null,

    // ── Host Matching Metadata ────────────────────
    hostRejections: payload.hostRejections || [],    // [{ hostId, reason, timestamp }]
    matchAttempts: payload.matchAttempts || 0,

    // ── Timestamps ───────────────────────────────
    assignedAt: payload.assignedAt || null,
    confirmedAt: payload.confirmedAt || null,
    startedAt: payload.startedAt || null,
    completedAt: payload.completedAt || null,
    cancelledAt: payload.cancelledAt || null,

    // ── Cancellation ─────────────────────────────
    cancelledBy: payload.cancelledBy || null,        // user | host | system
    cancelReason: payload.cancelReason || null,

    // ── Audit ─────────────────────────────────────
    createdAt: payload.createdAt || now,
    updatedAt: now,
  };
}

/**
 * Builds a clean public-facing booking response object
 * matching the response format defined in backend_documentation.md § 6.6
 */
function formatBookingResponse(booking, extras = {}) {
  return {
    bookingId: booking.bookingId,
    userId: booking.userId,
    hostId: booking.hostId,
    packageId: booking.packageId,
    categoryId: booking.categoryId,
    pricingModel: booking.pricingModel,
    status: booking.status,
    scheduledDate: booking.scheduledDate,
    scheduledTime: booking.scheduledTime,
    pickupLocation: booking.pickupLocation,
    specialInstructions: booking.specialInstructions,
    price: booking.price,
    razorpayOrderId: booking.razorpayOrderId || null,
    assignedHost: extras.assignedHost || null,
    hostRejections: booking.hostRejections || [],
    matchAttempts: booking.matchAttempts || 0,
    assignedAt: booking.assignedAt,
    confirmedAt: booking.confirmedAt,
    startedAt: booking.startedAt,
    completedAt: booking.completedAt,
    cancelledAt: booking.cancelledAt,
    cancelledBy: booking.cancelledBy,
    cancelReason: booking.cancelReason,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    // Denormalized display fields (from _attachUserDetails)
    clientName: booking.clientName || null,
    clientAvatar: booking.clientAvatar || null,
    hostName: booking.hostName || null,
    hostAvatar: booking.hostAvatar || null,
  };
}

module.exports = {
  formatBookingModel,
  formatBookingResponse,
  BOOKING_STATUSES,
};
