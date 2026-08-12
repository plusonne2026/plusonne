const express = require('express');
const router = express.Router();
const SOSController = require('../controllers/sos.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware.authenticate);

router.post('/trigger', SOSController.triggerSOS);
router.put('/:alertId/status', SOSController.updateSOSStatus);
router.get('/active', SOSController.getActiveAlerts);

module.exports = router;
