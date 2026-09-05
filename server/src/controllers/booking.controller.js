const BookingService = require("../services/booking.service");
const { createBookingSchema } = require("../validators/booking.validator");
const { formatBookingResponse } = require("../models/booking.model");
const { ROLES } = require("../config/constants");

class BookingController {
  // ─────────────────────────────────────────────
  // #1  POST /api/v1/bookings
  // ─────────────────────────────────────────────
  /**
   * Create a new booking.
   * Response matches docs § 6.6 — includes razorpayOrderId, assignedHost, price map.
   */
  static async createBooking(req, res, next) {
    try {
      const { error, value } = createBookingSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          error: error.details[0].message,
        });
      }

      const userId = req.user.userId;
      const booking = await BookingService.createBooking(userId, value);

      // Fetch assigned host details if any
      let assignedHost = null;
      if (booking.hostId) {
        assignedHost = await BookingService.getAssignedHostPublic(booking.hostId);
      }

      // POST /bookings response — minimal fields as per docs § 6.6
      return res.status(201).json({
        success: true,
        message: "Booking initiated successfully",
        data: {
          bookingId: booking.bookingId,
          status: booking.status,
          price: booking.price,
          razorpayOrderId: booking.razorpayOrderId || null,
          assignedHost,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #2  GET /api/v1/bookings/:bookingId
  // ─────────────────────────────────────────────
  static async getBookingById(req, res, next) {
    try {
      const { bookingId } = req.params;
      const { userId, role } = req.user;

      const booking = await BookingService.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Authorization: must be admin, or the user / host involved
      if (
        role !== ROLES.ADMIN &&
        booking.userId !== userId &&
        booking.hostId !== userId
      ) {
        return res.status(403).json({ success: false, message: "Access forbidden" });
      }

      let assignedHost = null;
      if (booking.hostId) {
        assignedHost = await BookingService.getAssignedHostPublic(booking.hostId);
      }

      return res.status(200).json({
        success: true,
        data: formatBookingResponse(booking, { assignedHost }),
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #3  GET /api/v1/bookings/my  (user)
  // ─────────────────────────────────────────────
  static async getMyBookings(req, res, next) {
    try {
      const { userId } = req.user;
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status || null;

      const bookings = await BookingService.getUserBookings(userId, limit, status);

      return res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings.map((b) => formatBookingResponse(b)),
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #4  GET /api/v1/bookings/host/my  (host)
  // ─────────────────────────────────────────────
  static async getHostMyBookings(req, res, next) {
    try {
      const { userId } = req.user;
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status || null;

      const bookings = await BookingService.getHostBookings(userId, limit, status);

      return res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings.map((b) => formatBookingResponse(b)),
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #5  PUT /api/v1/bookings/:bookingId/cancel
  // ─────────────────────────────────────────────
  static async cancelBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      const { role, userId } = req.user;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "reason is required",
        });
      }

      const booking = await BookingService.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      // Only admin, the user, or the assigned host can cancel
      if (
        role !== ROLES.ADMIN &&
        booking.userId !== userId &&
        booking.hostId !== userId
      ) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      // Cannot cancel completed/rated bookings
      if (["completed", "rated", "cancelled"].includes(booking.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel a booking with status '${booking.status}'`,
        });
      }

      const updated = await BookingService.cancelBooking(bookingId, reason, role);

      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: formatBookingResponse(updated),
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #6  PUT /api/v1/bookings/:bookingId/host-response
  // ─────────────────────────────────────────────
  /**
   * Host accepts or rejects a booking request.
   * Body: { action: "accept" | "reject", rejectReason: "..." }
   */
  static async hostResponse(req, res, next) {
    try {
      const { bookingId } = req.params;
      const hostId = req.user.userId;
      const { action, rejectReason } = req.body;

      if (!["accept", "reject"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "action must be 'accept' or 'reject'",
        });
      }

      if (action === "reject" && !rejectReason) {
        return res.status(400).json({
          success: false,
          message: "rejectReason is required when action is 'reject'",
        });
      }

      const booking = await BookingService.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      // Only the assigned host (or any available host for unassigned bookings) can respond
      if (booking.hostId && booking.hostId !== hostId) {
        return res.status(403).json({
          success: false,
          message: "You are not the assigned host for this booking",
        });
      }

      const updated = await BookingService.handleHostResponse(
        bookingId,
        hostId,
        action,
        rejectReason
      );

      let assignedHost = null;
      if (updated.hostId) {
        assignedHost = await BookingService.getAssignedHostPublic(updated.hostId);
      }

      return res.status(200).json({
        success: true,
        message: action === "accept" ? "Booking accepted" : "Booking rejected",
        data: formatBookingResponse(updated, { assignedHost }),
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #7  PUT /api/v1/bookings/:bookingId/swap-host
  // ─────────────────────────────────────────────
  /**
   * User requests a different host for their booking.
   * Body: { reason: "..." }  (optional)
   */
  static async swapHost(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.userId;
      const { reason } = req.body;

      const booking = await BookingService.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      if (booking.userId !== userId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      // Can only swap if still in assignment phase
      if (!["host_assigned", "host_confirmed", "pending_assignment"].includes(booking.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot swap host when booking status is '${booking.status}'`,
        });
      }

      const updated = await BookingService.requestHostSwap(bookingId, userId, reason);

      return res.status(200).json({
        success: true,
        message: "Host swap requested. We are finding you a new host.",
        data: formatBookingResponse(updated),
      });
    } catch (err) {
      next(err);
    }
  }

  // ─────────────────────────────────────────────
  // #8  GET /api/v1/bookings  (admin)
  // ─────────────────────────────────────────────
  static async getAllBookings(req, res, next) {
    try {
      const {
        status,
        userId,
        hostId,
        scheduledDate,
        limit = 20,
        lastKey,
      } = req.query;

      const filters = {
        status,
        userId,
        hostId,
        scheduledDate,
        limit: parseInt(limit, 10),
        lastKey,
      };

      const result = await BookingService.getAllBookings(filters);

      return res.status(200).json({
        success: true,
        count: result.items.length,
        data: result.items.map((b) => formatBookingResponse(b)),
        meta: {
          lastEvaluatedKey: result.lastKey || null,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BookingController;
