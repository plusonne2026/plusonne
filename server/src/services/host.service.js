const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");
const { formatHostProfileModel } = require("../models/host.model");
const { ROLES } = require("../config/constants");

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
