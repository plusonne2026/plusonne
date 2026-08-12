const express = require('express');
const router = express.Router();
const SessionController = require('../controllers/session.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware.authenticate);

router.post('/:bookingId/start', SessionController.startSession);
router.post('/:bookingId/end', SessionController.endSession);

module.exports = router;
