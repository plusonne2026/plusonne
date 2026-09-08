const SessionService = require('../services/session.service');
const {
  formatSessionStartResponse,
  formatSessionEndResponse,
} = require('../models/session.model');
const ChatController = require('./chat.controller');

class SessionController {
  /**
   * POST /api/v1/sessions/:bookingId/start
   * Role: host
   * Starts a session — updates Session + Booking + RTDB + notifies user
   */
  static async startSession(req, res, next) {
    try {
      const { bookingId } = req.params;
      const { userId: hostId } = req.user;
      const { location } = req.body;

      if (!location || !location.lat || !location.lng) {
        return res.status(400).json({
          success: false,
          message: "location.lat and location.lng are required",
        });
      }

      const session = await SessionService.startSession(bookingId, hostId, location);

      return res.status(200).json({
        success: true,
        data: formatSessionStartResponse(session),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/sessions/:bookingId/end
   * Role: host
   * Ends a session — calculates distance, overage, finalBill, cleans RTDB, notifies both
   */
  static async endSession(req, res, next) {
    try {
      const { bookingId } = req.params;
      const { userId: hostId } = req.user;
      const { location, chatMessages } = req.body;

      if (!location || !location.lat || !location.lng) {
        return res.status(400).json({
          success: false,
          message: "location.lat and location.lng are required",
        });
      }

      const session = await SessionService.endSession(bookingId, hostId, location, chatMessages);

      // Save chat history if provided
      if (chatMessages && chatMessages.length > 0) {
        try {
          await ChatController.saveSessionChat(bookingId, chatMessages);
        } catch (err) {
          console.warn("[SessionController] Chat save failed:", err.message);
        }
      }

      return res.status(200).json({
        success: true,
        data: formatSessionEndResponse(session),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/sessions/:bookingId/location
   * Role: host / user
   * Updates live location during an active session
   */
  static async updateLocation(req, res, next) {
    try {
      const { bookingId } = req.params;
      const { userId, role } = req.user;
      const { location } = req.body;

      if (!location || !location.lat || !location.lng) {
        return res.status(400).json({
          success: false,
          message: "location.lat and location.lng are required",
        });
      }

      const result = await SessionService.updateLocation(bookingId, userId, role, location);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/sessions/:bookingId
   * Role: any authenticated
   * Returns full session details
   */
  static async getSession(req, res, next) {
    try {
      const { bookingId } = req.params;

      const session = await SessionService.getSession(bookingId);

      return res.status(200).json({
        success: true,
        data: session,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/sessions/:bookingId/route
   * Role: any authenticated
   * Returns route history (routePoints + totalDistanceKm)
   */
  static async getRouteHistory(req, res, next) {
    try {
      const { bookingId } = req.params;

      const route = await SessionService.getRouteHistory(bookingId);

      return res.status(200).json({
        success: true,
        data: route,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/sessions/active
   * Role: admin
   * Returns all currently active sessions
   */
  static async getActiveSessions(req, res, next) {
    try {
      const sessions = await SessionService.getActiveSessions();

      return res.status(200).json({
        success: true,
        count: sessions.length,
        data: sessions,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SessionController;
