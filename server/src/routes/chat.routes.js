const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware.authenticate);

router.get('/:bookingId', ChatController.getChatHistory);
router.post('/:bookingId/notify', ChatController.notifyRecipient);

module.exports = router;
