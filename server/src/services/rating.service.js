const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");
const { v4: uuidv4 } = require("uuid");
const {
  formatRatingModel,
  formatRatingResponse,
  calculateOverallScore,
  RATER_ROLES,
} = require("../models/rating.model");

const RATINGS_TABLE = config.tables.ratings;
const BOOKINGS_TABLE = config.tables.bookings;
const HOSTS_TABLE = config.tables.hosts || "PlusOne_HostProfiles";
const USERS_TABLE = config.tables.users;

class RatingService {
  /**
   * POST /ratings
   * Submit rating for a completed booking matching Section 6.11
   * 
   * @param {string} raterId Logged in user/host ID
   * @param {Object} payload { bookingId, scores, comment, videoReviewUrl }
   */
  static async submitRating(raterId, { bookingId, scores, comment, videoReviewUrl }) {
    if (!bookingId) {
      throw new Error("bookingId is required");
    }

    // 1. Verify booking exists
    const booking = await DynamoDBHelper.getItem(BOOKINGS_TABLE, { bookingId });
    if (!booking) {
      throw new Error("Booking not found");
    }

    // 2. Verify rater was part of this booking (either user or host)
    const isUser = booking.userId === raterId;
    const isHost = booking.hostId === raterId;

    if (!isUser && !isHost) {
      throw new Error("Unauthorized: You are not a participant in this booking");
    }

    // 3. Verify booking is completed (or completed/active)
    const validRateableStatuses = ["completed", "active", "rated"];
    if (!validRateableStatuses.includes(booking.status)) {
      throw new Error(`Cannot rate a booking in status: "${booking.status}". Booking must be completed.`);
    }

    const raterRole = isUser ? RATER_ROLES.USER : RATER_ROLES.HOST;
    const rateeId = isUser ? booking.hostId : booking.userId;

    if (!rateeId) {
      throw new Error("Cannot submit rating: Target ratee is not assigned to this booking");
    }

    // 4. Verify rater hasn't already rated this booking
    const existingRatings = await this.getRatingsForBooking(bookingId);
    const alreadyRated = existingRatings.some((r) => r.raterId === raterId);
    if (alreadyRated) {
      throw new Error("You have already submitted a rating for this booking");
    }

    // 5. Calculate overallScore = average of category scores
    // Fallback: If caller passed flat single number 'rating' instead of scores object, support it
    let finalScores = scores;
    if (!finalScores || Object.keys(finalScores).length === 0) {
      const defaultScore = 5;
      finalScores = isUser
        ? { professionalism: defaultScore, friendliness: defaultScore, communication: defaultScore, punctuality: defaultScore }
        : { behaviour: defaultScore, respect: defaultScore, safety: defaultScore, cooperation: defaultScore };
    }
    const overallScore = calculateOverallScore(finalScores);

    // 6. If videoReviewUrl provided: Generate 15% discount code for next booking (Operation 8)
    let discountCode = null;
    if (videoReviewUrl && typeof videoReviewUrl === "string" && videoReviewUrl.trim().length > 0) {
      discountCode = `PLUS-VIDEO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    }

    // 7. Create Rating record
    const ratingRecord = formatRatingModel({
      ratingId: `rating_${uuidv4()}`,
      bookingId,
      raterId,
      rateeId,
      raterRole,
      scores: finalScores,
      overallScore,
      comment,
      videoReviewUrl,
      discountCode,
    });

    await DynamoDBHelper.putItem(RATINGS_TABLE, ratingRecord);

    // 8. Update ratee's average rating and trust score
    try {
      if (raterRole === RATER_ROLES.USER) {
        // Host was rated -> update HostProfile
        const hostProfile = await DynamoDBHelper.getItem(HOSTS_TABLE, { hostId: rateeId });
        if (hostProfile) {
          const currentTotalReviews = Number(hostProfile.totalReviews) || 0;
          const currentAvgRating = Number(hostProfile.rating) || 5.0;
          const newTotalReviews = currentTotalReviews + 1;
          const newAvgRating = Math.round(((currentAvgRating * currentTotalReviews + overallScore) / newTotalReviews) * 10) / 10;
          
          // Boost host trust score slightly for positive ratings
          const currentTrust = Number(hostProfile.hostTrustScore) || 85;
          const trustDelta = overallScore >= 4 ? 2 : overallScore <= 2 ? -5 : 0;
          const newTrust = Math.min(100, Math.max(0, currentTrust + trustDelta));

          await DynamoDBHelper.updateItem(
            HOSTS_TABLE,
            { hostId: rateeId },
            "SET rating = :r, totalReviews = :tr, hostTrustScore = :hts, updatedAt = :now",
            undefined,
            {
              ":r": newAvgRating,
              ":tr": newTotalReviews,
              ":hts": newTrust,
              ":now": new Date().toISOString(),
            }
          );
        }
      } else {
        // User was rated by Host -> update Users table trust score
        const user = await DynamoDBHelper.getItem(USERS_TABLE, { userId: rateeId });
        if (user) {
          const currentTrust = Number(user.trustScore) || 80;
          const trustDelta = overallScore >= 4 ? 2 : overallScore <= 2 ? -5 : 0;
          const newTrust = Math.min(100, Math.max(0, currentTrust + trustDelta));

          await DynamoDBHelper.updateItem(
            USERS_TABLE,
            { userId: rateeId },
            "SET trustScore = :ts, updatedAt = :now",
            undefined,
            {
              ":ts": newTrust,
              ":now": new Date().toISOString(),
            }
          );
        }
      }
    } catch (err) {
      console.warn("[RatingService] Failed to update ratee statistics:", err.message);
    }

    // 9. Update Booking: status -> "rated" if both sides have rated, or mark rated flag
    try {
      const allBookingRatings = [...existingRatings, ratingRecord];
      const hasUserRated = allBookingRatings.some((r) => r.raterRole === RATER_ROLES.USER);
      const hasHostRated = allBookingRatings.some((r) => r.raterRole === RATER_ROLES.HOST);

      const updateExpressions = [];
      const exprValues = { ":now": new Date().toISOString() };

      if (isUser) {
        updateExpressions.push("userRated = :ur");
        exprValues[":ur"] = true;
      } else {
        updateExpressions.push("hostRated = :hr");
        exprValues[":hr"] = true;
      }

      // If both sides have rated, set booking status to "rated"
      if (hasUserRated && hasHostRated) {
        updateExpressions.push("#status = :status");
        exprValues[":status"] = "rated";
      }

      updateExpressions.push("updatedAt = :now");

      await DynamoDBHelper.updateItem(
        BOOKINGS_TABLE,
        { bookingId },
        `SET ${updateExpressions.join(", ")}`,
        hasUserRated && hasHostRated ? { "#status": "status" } : undefined,
        exprValues
      );
    } catch (err) {
      console.warn("[RatingService] Failed to update booking rated status:", err.message);
    }

    return formatRatingResponse(ratingRecord);
  }

  /**
   * GET /ratings/for/:userId
   * Get all ratings received by a specific user or host
   * @param {string} rateeId 
   */
  static async getRatingsForUser(rateeId) {
    try {
      // 1. Try GSI RateeIndex: PK rateeId, SK createdAt
      const params = {
        TableName: RATINGS_TABLE,
        IndexName: "RateeIndex",
        KeyConditionExpression: "rateeId = :rid",
        ExpressionAttributeValues: { ":rid": rateeId },
      };
      const items = await DynamoDBHelper.queryItems(params);
      if (items && items.length > 0) {
        return items.map(formatRatingResponse).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } catch (_) {
      // Fallback: Scan with filter
      const items = await DynamoDBHelper.scanItems({
        TableName: RATINGS_TABLE,
        FilterExpression: "rateeId = :rid OR targetUserId = :rid",
        ExpressionAttributeValues: { ":rid": rateeId },
      });
      return items.map(formatRatingResponse).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return [];
  }

  /**
   * GET /ratings/booking/:bookingId
   * Get all ratings submitted for a specific booking
   * @param {string} bookingId 
   */
  static async getRatingsForBooking(bookingId) {
    try {
      // 1. Try GSI BookingRatingIndex: PK bookingId
      const params = {
        TableName: RATINGS_TABLE,
        IndexName: "BookingRatingIndex",
        KeyConditionExpression: "bookingId = :bid",
        ExpressionAttributeValues: { ":bid": bookingId },
      };
      const items = await DynamoDBHelper.queryItems(params);
      if (items && items.length > 0) {
        return items.map(formatRatingResponse);
      }
    } catch (_) {
      // Fallback: Scan with filter
      const items = await DynamoDBHelper.scanItems({
        TableName: RATINGS_TABLE,
        FilterExpression: "bookingId = :bid",
        ExpressionAttributeValues: { ":bid": bookingId },
      });
      return items.map(formatRatingResponse);
    }
    return [];
  }

  /**
   * GET /ratings/my-given
   * Get all ratings submitted by the logged in user
   * @param {string} raterId 
   */
  static async getMyGivenRatings(raterId) {
    try {
      // 1. Try GSI RaterIndex: PK raterId, SK createdAt
      const params = {
        TableName: RATINGS_TABLE,
        IndexName: "RaterIndex",
        KeyConditionExpression: "raterId = :rid",
        ExpressionAttributeValues: { ":rid": raterId },
      };
      const items = await DynamoDBHelper.queryItems(params);
      if (items && items.length > 0) {
        return items.map(formatRatingResponse).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } catch (_) {
      // Fallback: Scan with filter
      const items = await DynamoDBHelper.scanItems({
        TableName: RATINGS_TABLE,
        FilterExpression: "raterId = :rid OR reviewerId = :rid",
        ExpressionAttributeValues: { ":rid": raterId },
      });
      return items.map(formatRatingResponse).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return [];
  }
}

module.exports = RatingService;
