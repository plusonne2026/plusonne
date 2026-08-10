const express = require("express");
const BookingController = require("../controllers/booking.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

router.post("/", BookingController.createBooking);
router.get("/my", BookingController.getMyBookings);
router.get("/:bookingId", BookingController.getBookingById);
router.put("/:bookingId/status", BookingController.updateStatus);
router.put("/:bookingId/cancel", BookingController.cancelBooking);

module.exports = router;
