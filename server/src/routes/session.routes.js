const express = require('express');
const router = express.Router();
const SessionController = require('../controllers/session.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

// All session routes require authentication
router.use(authMiddleware.authenticate);

// ── GET /sessions/active — must be BEFORE /:bookingId to avoid conflict ──
router.get('/active', requireRole(ROLES.ADMIN), SessionController.getActiveSessions);

// ── POST /sessions/:bookingId/start — host only ──
router.post('/:bookingId/start', requireRole(ROLES.HOST), SessionController.startSession);

// ── POST /sessions/:bookingId/end — host only ──
router.post('/:bookingId/end', requireRole(ROLES.HOST), SessionController.endSession);

// ── PUT /sessions/:bookingId/location — host or user ──
router.put('/:bookingId/location', requireRole(ROLES.HOST, ROLES.USER), SessionController.updateLocation);

// ── GET /sessions/:bookingId — any authenticated ──
router.get('/:bookingId', SessionController.getSession);

// ── GET /sessions/:bookingId/route — any authenticated ──
router.get('/:bookingId/route', SessionController.getRouteHistory);

module.exports = router;
