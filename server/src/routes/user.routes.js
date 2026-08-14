const express = require("express");
const UserController = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/me", UserController.getMe);
router.put("/fcm-token", UserController.updateFcmToken);
router.put("/:userId", UserController.updateMe); // Matches client api call

module.exports = router;
