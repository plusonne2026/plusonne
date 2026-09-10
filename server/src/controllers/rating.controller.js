const RatingService = require("../services/rating.service");

class RatingController {
  /**
   * POST /api/v1/ratings
   * Submit rating for a completed booking
   * Auth: user/host
   */
  static async submitRating(req, res, next) {
    try {
      const raterId = req.user.userId || req.user.uid;
      const { bookingId, scores, rating, comment, review, videoReviewUrl } = req.body;

      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: "bookingId is required",
        });
      }

      // Support documented format: { scores, comment, videoReviewUrl }
      // Fallback: If caller passed legacy single 'rating' / 'review'
      let finalScores = scores;
      if (!finalScores && rating) {
        finalScores = {
          professionalism: Number(rating),
          friendliness: Number(rating),
          communication: Number(rating),
          punctuality: Number(rating),
        };
      }

      const ratingRecord = await RatingService.submitRating(raterId, {
        bookingId,
        scores: finalScores,
        comment: comment || review || "",
        videoReviewUrl,
      });

      return res.status(201).json({
        success: true,
        message: "Rating submitted successfully",
        data: ratingRecord,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/ratings/for/:userId
   * Get ratings received by a user or host
   * Auth: any authenticated user
   */
  static async getRatingsForUser(req, res, next) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required",
        });
      }

      const ratings = await RatingService.getRatingsForUser(userId);
      return res.status(200).json({
        success: true,
        count: ratings.length,
        data: ratings,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/ratings/booking/:bookingId
   * Get ratings for a booking
   * Auth: any authenticated user
   */
  static async getRatingsForBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: "bookingId is required",
        });
      }

      const ratings = await RatingService.getRatingsForBooking(bookingId);
      return res.status(200).json({
        success: true,
        count: ratings.length,
        data: ratings,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/ratings/my-given
   * Get ratings I've given
   * Auth: any authenticated user
   */
  static async getMyGivenRatings(req, res, next) {
    try {
      const raterId = req.user.userId || req.user.uid;
      const ratings = await RatingService.getMyGivenRatings(raterId);
      return res.status(200).json({
        success: true,
        count: ratings.length,
        data: ratings,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = RatingController;
