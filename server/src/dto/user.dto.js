/**
 * User DTO (Data Transfer Object)
 *
 * Ye file define karti hai ki API responses mein
 * user ka data kaisa dikhega — DynamoDB ke full record ko
 * controlled format mein convert karti hai.
 *
 * USAGE:
 *   const { toPublicProfile, toSessionProfile } = require('../dto/user.dto');
 *   return res.json({ success: true, data: toPublicProfile(user) });
 */

/**
 * Session Profile — Login/Register/VerifyToken responses ke liye
 * Documentation spec: userId, email, phone, displayName, role, isVerified, trustScore, createdAt
 */
function toSessionProfile(user) {
  return {
    userId:      user.userId,
    email:       user.email       || null,
    phone:       user.phone       || null,
    displayName: user.displayName,
    role:        user.role,
    isVerified:  user.isVerified,
    trustScore:  user.trustScore,
    createdAt:   user.createdAt,
  };
}

/**
 * Full Public Profile — GET /auth/me aur complete-profile responses ke liye
 * User apna poora profile dekhe tab use karo.
 */
function toFullProfile(user) {
  return {
    ...toSessionProfile(user),
    firebaseUid:        user.firebaseUid,
    avatarUrl:          user.avatarUrl          || null,
    authProvider:       user.authProvider,
    city:               user.city               || "",
    coordinates:        user.coordinates        || { lat: 0, lng: 0 },
    preferredLanguages: user.preferredLanguages || ["en"],
    referralCode:       user.referralCode       || null,
    totalBookings:      user.totalBookings       || 0,
    totalSpent:         user.totalSpent          || 0,
    status:             user.status,
    updatedAt:          user.updatedAt,
    lastLoginAt:        user.lastLoginAt,
  };
}

module.exports = {
  toSessionProfile,
  toFullProfile,
};
