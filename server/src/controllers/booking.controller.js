const BookingService = require("../services/booking.service");
const { createBookingSchema, updateBookingStatusSchema } = require("../validators/booking.validator");
const { ROLES } = require("../config/constants");

class BookingController {
  /**
   * POST /api/v1/bookings
   * Create a new booking
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

      return res.status(201).json({
        success: true,
        message: "Booking initiated successfully",
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/bookings/my
   * Get user's or host's bookings based on role or query param
   */
  static async getMyBookings(req, res, next) {
    try {
      const { userId, role } = req.user;
      const limit = parseInt(req.query.limit) || 20;
      const asRole = req.query.as || role; // Allow overriding via ?as=user or ?as=host
      
      let bookings = [];
      if (asRole === ROLES.HOST) {
        bookings = await BookingService.getHostBookings(userId, limit);
      } else {
        bookings = await BookingService.getUserBookings(userId, limit);
      }

      return res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/bookings/requests
   * Get all PENDING_MATCH bookings for hosts
   */
  static async getBookingRequests(req, res, next) {
    try {
      const { role } = req.user;
      if (role !== "host" && role !== "admin") {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const requests = await BookingService.getBookingRequests();
      
      return res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/bookings/:bookingId
   * Get specific booking
   */
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

      // Check authorization (must be admin, or the user/host involved)
      if (role !== ROLES.ADMIN && booking.userId !== userId && booking.hostId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access forbidden",
        });
      }

      return res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/bookings/:bookingId/status
   * Update booking status (e.g. host accepts)
   */
  static async updateStatus(req, res, next) {
    try {
      const { bookingId } = req.params;
      const { role, userId } = req.user;
      
      const { error, value } = updateBookingStatusSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          error: error.details[0].message,
        });
      }

      const booking = await BookingService.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }
      
      // Authorization
      if (role === ROLES.USER && booking.userId !== userId) {
          return res.status(403).json({ success: false, message: "Forbidden" });
      }
      if (role === ROLES.HOST && booking.hostId !== userId && booking.hostId !== null) {
          return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const updated = await BookingService.updateBookingStatus(bookingId, value.status, role, userId, value.reason);

      return res.status(200).json({
        success: true,
        message: "Status updated",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/bookings/:bookingId/cancel
   * Cancel a booking
   */
  static async cancelBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      const { role, userId } = req.user;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ success: false, message: "Reason is required" });
      }

      const booking = await BookingService.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      if (role !== ROLES.ADMIN && booking.userId !== userId && booking.hostId !== userId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const updated = await BookingService.cancelBooking(bookingId, reason, role);

      return res.status(200).json({
        success: true,
        message: "Booking cancelled",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BookingController;
