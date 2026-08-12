const BookingService = require('../services/booking.service');

class SessionController {
  /**
   * POST /api/v1/sessions/:bookingId/start
   */
  static async startSession(req, res, next) {
    try {
      const { bookingId } = req.params;
      const { userId, role } = req.user;

      // Only host can start a session, but let's allow admin for testing or both for MVP
      const updated = await BookingService.updateBookingStatus(
        bookingId,
        "in_session",
        role,
        userId
      );

      return res.status(200).json({
        success: true,
        message: "Session started successfully",
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/sessions/:bookingId/end
   */
  static async endSession(req, res, next) {
    try {
      const { bookingId } = req.params;
      const { userId, role } = req.user;

      const updated = await BookingService.updateBookingStatus(
        bookingId,
        "completed",
        role,
        userId
      );

      return res.status(200).json({
        success: true,
        message: "Session completed successfully",
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SessionController;
