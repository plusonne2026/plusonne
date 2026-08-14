const DynamoDBHelper = require("../clients/dynamodb.client");
const { v4: uuidv4 } = require("uuid");
const config = require("../config/env");

const RatingController = {
  /**
   * Submit a rating and review for a booking
   * POST /api/v1/ratings
   */
  submitRating: async (req, res) => {
    try {
      const { bookingId, targetUserId, rating, review, tags } = req.body;
      const reviewerId = req.user.uid;

      if (!bookingId || !targetUserId || !rating) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }

      // Check if booking exists
      const booking = await DynamoDBHelper.getItem(config.tables.bookings, { bookingId });
      if (!booking) {
        return res.status(404).json({ success: false, error: "Booking not found" });
      }

      // Create rating record
      const ratingId = `rating_${uuidv4()}`;
      const ratingData = {
        ratingId,
        bookingId,
        reviewerId,
        targetUserId,
        rating: Number(rating),
        review: review || "",
        tags: tags || [],
        createdAt: new Date().toISOString()
      };

      await DynamoDBHelper.putItem(config.tables.ratings, ratingData);

      // Update booking status to indicate it has been rated
      await DynamoDBHelper.updateItem(
        config.tables.bookings, 
        { bookingId }, 
        "SET #isRated = :isRated",
        { "#isRated": "isRated" },
        { ":isRated": true }
      );

      // Update target user's trust score/average rating (simplified for MVP)
      const targetUser = await DynamoDBHelper.getItem(config.tables.users, { userId: targetUserId });
      if (targetUser) {
        const currentScore = targetUser.trustScore || 80; // default 80
        // simple rolling average mock
        const newScore = Math.min(100, Math.max(0, currentScore + (Number(rating) - 3) * 2));
        
        await DynamoDBHelper.updateItem(
          config.tables.users, 
          { userId: targetUserId }, 
          "SET #trustScore = :trustScore",
          { "#trustScore": "trustScore" },
          { ":trustScore": newScore }
        );
      }

      res.status(201).json({ success: true, data: ratingData });
    } catch (error) {
      console.error("PlusOnne API Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = RatingController;
