const express = require("express");
const router = express.Router();
const RatingController = require("../controllers/rating.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { ROLES } = require("../config/constants");

// All rating routes require authentication
router.use(authMiddleware.authenticate);

// 1. POST /api/v1/ratings — Submit rating for a completed booking (user or host)
router.post(
  "/",
  requireRole(ROLES.USER, ROLES.HOST, ROLES.ADMIN),
  RatingController.submitRating
);

// 2. GET /api/v1/ratings/for/:userId — Get ratings received by a user/host (any authenticated user)
router.get("/for/:userId", RatingController.getRatingsForUser);

// 3. GET /api/v1/ratings/booking/:bookingId — Get ratings for a booking (any authenticated user)
router.get("/booking/:bookingId", RatingController.getRatingsForBooking);

// 4. GET /api/v1/ratings/my-given — Get ratings I've given (any authenticated user)
router.get("/my-given", RatingController.getMyGivenRatings);

module.exports = router;
