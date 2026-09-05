const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");
const { formatHostProfileModel } = require("../models/host.model");
const { ROLES } = require("../config/constants");

// Try to load ngeohash for geospatial queries (graceful fallback if not installed)
let ngeohash;
try { ngeohash = require("ngeohash"); } catch (_) { ngeohash = null; }

const HOSTS_TABLE = config.tables.hosts;
const USERS_TABLE = config.tables.users;

class HostService {
  /**
   * Register or update a host profile and promote user role to "host"
   */
  static async registerHost(payload) {
    const hostProfile = formatHostProfileModel(payload);

    // 1. Put host profile into PlusOne_HostProfiles table
    await DynamoDBHelper.putItem(HOSTS_TABLE, hostProfile);

    // 2. Update role to "host" in PlusOne_Users table
    const now = new Date().toISOString();
    await DynamoDBHelper.updateItem(
      USERS_TABLE,
      { userId: payload.userId },
      "SET #role = :role, updatedAt = :now",
      { "#role": "role" },
      { ":role": ROLES.HOST, ":now": now }
    );

    return hostProfile;
  }

  /**
   * Get host profile joined with user basic details
   */
  static async getHostProfile(hostId) {
    const hostProfile = await DynamoDBHelper.getItem(HOSTS_TABLE, { hostId });
    if (!hostProfile) {
      return null;
    }

    const userProfile = await DynamoDBHelper.getItem(USERS_TABLE, { userId: hostId });
    return {
      ...hostProfile,
      displayName: userProfile?.displayName || "Verified Host",
      avatarUrl: userProfile?.avatarUrl || null,
      city: userProfile?.city || "",
    };
  }

  /**
   * Update bank account details (can be used post-onboarding if skipped)
   */
  static async updateBankDetails(hostId, bankDetails) {
    const now = new Date().toISOString();
    const updated = await DynamoDBHelper.updateItem(
      HOSTS_TABLE,
      { hostId },
      "SET bankDetails = :bankDetails, updatedAt = :now",
      undefined,
      { ":bankDetails": bankDetails, ":now": now }
    );
    return updated;
  }

  /**
   * Update host profile basic info
   */
  static async updateProfile(hostId, payload) {
    const now = new Date().toISOString();
    
    // We dynamically build the update expression based on provided fields
    const allowedFields = ["bio", "categories", "languages", "city"];
    let updateExpression = "SET updatedAt = :now";
    const expressionAttributeNames = {};
    const expressionAttributeValues = { ":now": now };

    for (const field of allowedFields) {
      if (payload[field] !== undefined) {
        updateExpression += `, #${field} = :${field}`;
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = payload[field];
      }
    }

    const updated = await DynamoDBHelper.updateItem(
      HOSTS_TABLE,
      { hostId },
      updateExpression,
      Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      expressionAttributeValues
    );
    
    // If city is provided, we should probably update it in the USERS_TABLE too, but for MVP it's okay to just keep in Host table if needed, or update user table.
    // Actually, city is stored in USERS_TABLE mostly. Let's update it there if provided.
    if (payload.city !== undefined) {
      await DynamoDBHelper.updateItem(
        USERS_TABLE,
        { userId: hostId },
        "SET city = :city, updatedAt = :now",
        undefined,
        { ":city": payload.city, ":now": now }
      );
    }

    return updated;
  }

  /**
   * Update online status (toggle)
   */
  static async updateOnlineStatus(hostId, isOnline) {
    const now = new Date().toISOString();
    const updated = await DynamoDBHelper.updateItem(
      HOSTS_TABLE,
      { hostId },
      "SET isOnline = :isOnline, updatedAt = :now",
      undefined,
      { ":isOnline": isOnline, ":now": now }
    );
    return updated;
  }

  /**
   * Update host schedule and availability
   */
  static async updateAvailability(hostId, schedule) {
    const now = new Date().toISOString();
    const updated = await DynamoDBHelper.updateItem(
      HOSTS_TABLE,
      { hostId },
      "SET schedule = :schedule, updatedAt = :now",
      undefined,
      { ":schedule": schedule, ":now": now }
    );
    return updated;
  }

  /**
   * Upload or update KYC documents
   */
  static async uploadKYC(hostId, documents) {
    const now = new Date().toISOString();
    const updated = await DynamoDBHelper.updateItem(
      HOSTS_TABLE,
      { hostId },
      "SET kycDocuments = :docs, kycStatus = :status, updatedAt = :now",
      undefined,
      { ":docs": documents, ":status": "pending", ":now": now }
    );
    return updated;
  }

  /**
   * Admin: Approve or Reject KYC status
   */
  static async updateKycStatus(hostId, kycStatus, rejectionReason = null) {
    const now = new Date().toISOString();
    const updateExpr = rejectionReason
      ? "SET kycStatus = :status, rejectionReason = :reason, updatedAt = :now"
      : "SET kycStatus = :status, updatedAt = :now";
    const expressionAttributeValues = rejectionReason
      ? { ":status": kycStatus, ":reason": rejectionReason, ":now": now }
      : { ":status": kycStatus, ":now": now };

    const updatedHost = await DynamoDBHelper.updateItem(
      HOSTS_TABLE,
      { hostId },
      updateExpr,
      undefined,
      expressionAttributeValues
    );

    // If verified, ensure user role is active "host" and trustScore is elevated
    if (kycStatus === "verified") {
      await DynamoDBHelper.updateItem(
        USERS_TABLE,
        { userId: hostId },
        "SET #role = :role, isVerified = :verified, updatedAt = :now",
        { "#role": "role" },
        { ":role": ROLES.HOST, ":verified": true, ":now": now }
      );
    }

    // Notify Host via FCM
    try {
      const FCMClient = require('../clients/fcm.client');
      const user = await DynamoDBHelper.getItem(USERS_TABLE, { userId: hostId });
      if (user && user.fcmToken) {
        let title = "Host Application Update";
        let body = `Your KYC status is now ${kycStatus}.`;
        if (kycStatus === "verified") {
          title = "Host Verified! 🎉";
          body = "Congratulations, your host application has been approved.";
        } else if (kycStatus === "rejected") {
          title = "Host Application Rejected";
          body = `Reason: ${rejectionReason || "Please check your documents."}`;
        }
        await FCMClient.sendPushNotification(user.fcmToken, title, body, { type: "kyc" });
      }
    } catch (err) {
      console.error("Failed to send KYC FCM to host:", err);
    }

    return updatedHost;
  }

  /**
   * Admin: Get all pending KYC applications
   */
  static async getPendingKycApplications() {
    const allHosts = await DynamoDBHelper.scanItems({ TableName: HOSTS_TABLE });
    return allHosts.filter((host) => host.kycStatus === "pending");
  }

  /**
   * Update host's current GPS location + geohash
   */
  static async updateLocation(hostId, { lat, lng }) {
    const now = new Date().toISOString();

    // Compute geohash6 if ngeohash is available
    const geohash6 = ngeohash ? ngeohash.encode(lat, lng, 6) : null;

    const updateExpr = geohash6
      ? "SET currentLocation = :loc, geohash6 = :geo, updatedAt = :now"
      : "SET currentLocation = :loc, updatedAt = :now";

    const exprValues = geohash6
      ? { ":loc": { lat, lng, updatedAt: now }, ":geo": geohash6, ":now": now }
      : { ":loc": { lat, lng, updatedAt: now }, ":now": now };

    const updated = await DynamoDBHelper.updateItem(
      HOSTS_TABLE,
      { hostId },
      updateExpr,
      undefined,
      exprValues
    );
    return updated;
  }

  /**
   * Get paginated payout / earnings history from Transactions table
   */
  static async getEarningsHistory(hostId, { limit = 20, lastKey } = {}) {
    const TRANSACTIONS_TABLE = config.tables.transactions;
    if (!TRANSACTIONS_TABLE) {
      // Graceful fallback — return empty if table not configured yet
      return { items: [], lastKey: null };
    }

    const params = {
      TableName: TRANSACTIONS_TABLE,
      IndexName: "UserTransactionsIndex",
      KeyConditionExpression: "userId = :uid",
      FilterExpression: "#type = :payout",
      ExpressionAttributeNames: { "#type": "type" },
      ExpressionAttributeValues: { ":uid": hostId, ":payout": "payout" },
      ScanIndexForward: false, // newest first
      Limit: limit,
    };

    if (lastKey) {
      try {
        params.ExclusiveStartKey = JSON.parse(Buffer.from(lastKey, "base64").toString("utf8"));
      } catch (_) { /* ignore bad cursor */ }
    }

    const result = await DynamoDBHelper.queryItems(params);
    const encodedLastKey = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
      : null;

    return { items: result.Items || [], lastKey: encodedLastKey };
  }

  /**
   * Search / filter verified hosts with optional filters
   */
  static async searchHosts({ city, category, minRating, isOnline, language, limit = 20 } = {}) {
    const allHosts = await DynamoDBHelper.scanItems({ TableName: HOSTS_TABLE });

    let filtered = allHosts.filter((h) => h.kycStatus === "verified");

    if (city) filtered = filtered.filter((h) => h.city?.toLowerCase() === city.toLowerCase());
    if (category) filtered = filtered.filter((h) => Array.isArray(h.categories) && h.categories.includes(category));
    if (minRating !== undefined) filtered = filtered.filter((h) => (h.rating || 0) >= minRating);
    if (isOnline !== undefined) filtered = filtered.filter((h) => h.isOnline === isOnline);
    if (language) filtered = filtered.filter((h) => Array.isArray(h.languages) && h.languages.map((l) => l.toLowerCase()).includes(language.toLowerCase()));

    // Sort by rating descending
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    const items = filtered.slice(0, limit);

    // Attach displayName + avatarUrl from Users table
    const enriched = await Promise.all(
      items.map(async (host) => {
        const user = await DynamoDBHelper.getItem(USERS_TABLE, { userId: host.hostId });
        return {
          ...host,
          displayName: user?.displayName || "Verified Host",
          avatarUrl: user?.avatarUrl || null,
        };
      })
    );

    return { items: enriched, lastKey: null };
  }

  /**
   * Find nearby online verified hosts using geohash neighbor-cell querying
   */
  static async getNearbyHosts({ lat, lng, radiusKm = 10, categoryId, minRating, limit = 20 } = {}) {
    const allHosts = await DynamoDBHelper.scanItems({ TableName: HOSTS_TABLE });

    // Filter: online + verified + has location
    let candidates = allHosts.filter(
      (h) => h.kycStatus === "verified" && h.isOnline && h.currentLocation?.lat && h.currentLocation?.lng
    );

    // Haversine distance filter
    const toRad = (deg) => (deg * Math.PI) / 180;
    const haversine = (lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    candidates = candidates.map((h) => ({
      ...h,
      distanceKm: haversine(lat, lng, h.currentLocation.lat, h.currentLocation.lng),
    }));

    candidates = candidates.filter((h) => h.distanceKm <= radiusKm);

    if (categoryId) candidates = candidates.filter((h) => Array.isArray(h.categories) && h.categories.includes(categoryId));
    if (minRating !== undefined) candidates = candidates.filter((h) => (h.rating || 0) >= minRating);

    // Sort by distance
    candidates.sort((a, b) => a.distanceKm - b.distanceKm);

    const items = candidates.slice(0, limit);

    // Attach display info from Users table
    const enriched = await Promise.all(
      items.map(async (host) => {
        const user = await DynamoDBHelper.getItem(USERS_TABLE, { userId: host.hostId });
        return {
          hostId: host.hostId,
          displayName: user?.displayName || "Verified Host",
          avatarUrl: user?.avatarUrl || null,
          rating: host.rating || 0,
          totalReviews: host.totalReviews || 0,
          languages: host.languages || [],
          categories: host.categories || [],
          distanceKm: parseFloat(host.distanceKm.toFixed(2)),
          isOnline: host.isOnline,
        };
      })
    );

    return enriched;
  }

  /**
   * Public/User: Get all active, verified hosts
   */
  static async getActiveHosts() {
    const allHosts = await DynamoDBHelper.scanItems({ TableName: HOSTS_TABLE });
    // Filter for verified hosts. We can also check isOnline here if needed.
    const verifiedHosts = allHosts.filter(
      (host) => host.kycStatus === "verified"
    );

    // Fetch user details for each verified host to get displayName, avatarUrl, and city
    const activeHostsWithUserDetails = await Promise.all(
      verifiedHosts.map(async (host) => {
        const userProfile = await DynamoDBHelper.getItem(USERS_TABLE, {
          userId: host.hostId,
        });
        return {
          ...host,
          displayName: userProfile?.displayName || "Verified Host",
          avatarUrl: userProfile?.avatarUrl || null,
          city: userProfile?.city || "",
        };
      })
    );

    return activeHostsWithUserDetails;
  }
}

module.exports = HostService;
