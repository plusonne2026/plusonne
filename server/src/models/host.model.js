const { v4: uuidv4 } = require("uuid");

/**
 * Creates a normalized PlusOne_HostProfiles table document matching Table 2 specs in backend_documentation.md
 */
function formatHostProfileModel(payload) {
  const now = new Date().toISOString();

  return {
    hostId: payload.hostId || payload.userId, // Same as userId in Users table
    categories: payload.categories || ["coffee_date"],
    bio: payload.bio || "",
    isOnline: Boolean(payload.isOnline || false),
    currentLocation: payload.currentLocation || {
      lat: 0,
      lng: 0,
      geohash: "",
      updatedAt: now,
    },
    geohash6: payload.geohash6 || "",
    rating: typeof payload.rating === "number" ? payload.rating : 5.0,
    totalReviews: payload.totalReviews || 0,
    totalCompletions: payload.totalCompletions || 0,
    totalCancellations: payload.totalCancellations || 0,
    responseTimeAvg: payload.responseTimeAvg || 120, // 2 minutes average response
    completionRate: payload.completionRate || 100,
    languages: payload.languages || ["English"],
    experienceYears: typeof payload.experienceYears === "number" ? payload.experienceYears : 1,
    kycStatus: payload.kycStatus || "verified", // Auto-verified for MVP testing
    kycDocuments: payload.kycDocuments || {
      aadhaarUrl: null,
      panUrl: null,
      photoUrl: null,
    },
    // Optional bankDetails on onboarding: null if skipped
    bankDetails: payload.bankDetails || null,
    hostTrustScore: payload.hostTrustScore || 85,
    earnings: payload.earnings || {
      thisMonth: 0,
      lastMonth: 0,
      total: 0,
      pending: 0,
    },
    schedule: payload.schedule || [],
    createdAt: payload.createdAt || now,
    updatedAt: now,
  };
}

module.exports = {
  formatHostProfileModel,
};
