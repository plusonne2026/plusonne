/**
 * Rating Model — PlusOne_Ratings (Table 12)
 *
 * Two-way ratings after session completion.
 *
 * | Attribute       | Type          | Description                         |
 * |-----------------|---------------|-------------------------------------|
 * | ratingId (PK)   | String (UUID) | Unique rating ID                    |
 * | bookingId       | String        | Which booking this rating is for    |
 * | raterId         | String        | Who gave the rating                 |
 * | rateeId         | String        | Who received the rating             |
 * | raterRole       | String        | "user" / "host"                     |
 * | scores          | Map           | Role-dependent scores (1-5 each)    |
 * | overallScore    | Number        | 1.0-5.0 average of category scores  |
 * | comment         | String        | Optional text review                |
 * | videoReviewUrl  | String        | Cloudinary URL (for video review)   |
 * | discountCode    | String        | Generated reward for video reviews  |
 * | createdAt       | String (ISO)  | Timestamp                           |
 *
 * GSIs:
 * 1. RateeIndex: PK rateeId, SK createdAt
 * 2. BookingRatingIndex: PK bookingId, SK raterRole
 * 3. RaterIndex: PK raterId, SK createdAt
 */

const { v4: uuidv4 } = require("uuid");

const RATER_ROLES = {
  USER: "user",
  HOST: "host",
};

// Expected score categories per rater role
const SCORE_CATEGORIES = {
  user: ["professionalism", "friendliness", "communication", "punctuality"],
  host: ["behaviour", "respect", "safety", "cooperation"],
};

/**
 * Calculates average overall score from category scores
 * @param {Object} scores 
 * @returns {number} 1.0 - 5.0 rounded to 1 decimal
 */
function calculateOverallScore(scores = {}) {
  const values = Object.values(scores)
    .map((v) => Number(v))
    .filter((v) => !isNaN(v) && v >= 1 && v <= 5);

  if (values.length === 0) return 5.0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

/**
 * Formats a Rating document for DynamoDB Table 12
 * @param {Object} payload 
 * @returns {Object}
 */
function formatRatingModel(payload) {
  const now = new Date().toISOString();
  const raterRole = payload.raterRole || RATER_ROLES.USER;
  const scores = payload.scores || {};
  const overallScore = calculateOverallScore(scores);

  return {
    ratingId: payload.ratingId || uuidv4(),
    bookingId: payload.bookingId,
    raterId: payload.raterId,
    rateeId: payload.rateeId,
    raterRole,
    scores,
    overallScore,
    comment: payload.comment || "",
    videoReviewUrl: payload.videoReviewUrl || null,
    discountCode: payload.discountCode || null,
    createdAt: payload.createdAt || now,
    updatedAt: now,
  };
}

/**
 * Formats Rating response object for public API responses
 * @param {Object} rating 
 * @returns {Object}
 */
function formatRatingResponse(rating) {
  if (!rating) return null;

  return {
    ratingId: rating.ratingId,
    bookingId: rating.bookingId,
    raterId: rating.raterId,
    rateeId: rating.rateeId,
    raterRole: rating.raterRole,
    scores: rating.scores,
    overallScore: rating.overallScore,
    comment: rating.comment,
    videoReviewUrl: rating.videoReviewUrl,
    discountCode: rating.discountCode || undefined,
    createdAt: rating.createdAt,
  };
}

module.exports = {
  RATER_ROLES,
  SCORE_CATEGORIES,
  calculateOverallScore,
  formatRatingModel,
  formatRatingResponse,
};
