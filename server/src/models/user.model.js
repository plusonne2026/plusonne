const { v4: uuidv4 } = require("uuid");
const { ROLES, USER_STATUS } = require("../config/constants");

/**
 * Creates a normalized PlusOne_Users table document matching backend_documentation.md Table 1 specs
 */
function formatUserModel(payload) {
  const now = new Date().toISOString();

  return {
    userId: payload.userId || uuidv4(),
    email: payload.email || null,
    phone: payload.phone || null,
    displayName: payload.displayName || "PlusOnne User",
    avatarUrl: payload.avatarUrl || null,
    role: payload.role || ROLES.USER,
    authProvider: payload.authProvider || "google",
    firebaseUid: payload.firebaseUid,
    isVerified: Boolean(payload.isVerified || true),
    status: payload.status || USER_STATUS.ACTIVE,
    city: payload.city || "",
    coordinates: payload.coordinates || { lat: 0, lng: 0 },
    preferredLanguages: payload.preferredLanguages || ["en"],
    trustScore: payload.trustScore || 80,
    totalBookings: payload.totalBookings || 0,
    totalSpent: payload.totalSpent || 0,
    referralCode: payload.referralCode || `PLUS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    createdAt: payload.createdAt || now,
    updatedAt: now,
    lastLoginAt: now,
  };
}

module.exports = {
  formatUserModel,
};
