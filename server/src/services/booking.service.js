const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");
const { v4: uuidv4 } = require("uuid");
const { formatBookingModel } = require("../models/booking.model");

const BOOKINGS_TABLE = config.tables.bookings;
const PACKAGES_TABLE = config.tables.packages;
const HOSTS_TABLE = config.tables.hosts;

const UnitService = require("./unit.service");
const FCMClient = require("../clients/fcm.client");

class BookingService {
  static async createBooking(userId, payload) {
    const now = new Date().toISOString();
    let status = "pending_payment";
    let price = { base: 0, extras: 0, overage: 0, discount: 0, tax: 0, total: 0, currency: "INR" };
    let razorpayOrderId = null;

    // ── Package-based pricing ─────────────────────────────────
    if (payload.pricingModel === "package" && payload.packageId) {
      const pkg = await DynamoDBHelper.getItem(PACKAGES_TABLE, { packageId: payload.packageId });
      if (!pkg) throw new Error("Package not found");
      const base = pkg.basePrice || 1000;
      const tax  = Math.round(base * 0.18);
      price = { base, extras: 0, overage: 0, discount: 0, tax, total: base + tax, currency: "INR" };
      // TODO: create Razorpay order here and set razorpayOrderId
      status = "pending_payment";
    }

    // ── Unit-wallet pricing ───────────────────────────────────
    if (payload.pricingModel === "unit") {
      const pkg = payload.packageId
        ? await DynamoDBHelper.getItem(PACKAGES_TABLE, { packageId: payload.packageId })
        : null;
      const durationHours = pkg?.durationHours || 1;
      const userBalance = await UnitService.getUserBalance(userId);
      if (userBalance.hoursBalance < durationHours) {
        throw new Error(`Insufficient unit balance. Need at least ${durationHours} hours.`);
      }
      await UnitService.adjustUserBalance(userId, -durationHours, 0);
      price = { base: 0, extras: 0, overage: 0, discount: 0, tax: 0, total: 0, currency: "INR" };
      status = "pending_assignment";
    }

    // ── Subscription pricing ──────────────────────────────────
    if (payload.pricingModel === "subscription") {
      // TODO: check active subscription balance
      price = { base: 0, extras: 0, overage: 0, discount: 0, tax: 0, total: 0, currency: "INR" };
      status = "pending_assignment";
    }

    const booking = formatBookingModel({
      bookingId: uuidv4(),
      userId,
      hostId: payload.preferredHostId || null,
      ...payload,
      status,
      price,
      razorpayOrderId,
      matchAttempts: 0,
      createdAt: now,
    });

    await DynamoDBHelper.putItem(BOOKINGS_TABLE, booking);

    // Notify preferred host if specified
    if (booking.hostId) {
      try {
        const hostUser = await DynamoDBHelper.getItem(config.tables.users, { userId: booking.hostId });
        if (hostUser?.fcmToken) {
          await FCMClient.sendPushNotification(
            hostUser.fcmToken,
            "New Booking Request!",
            "A user has requested a session with you.",
            { type: "booking_request", bookingId: booking.bookingId }
          );
        }
      } catch (err) {
        console.error("Failed to send booking FCM to host:", err);
      }
    }

    return booking;
  }

  static async getBookingById(bookingId) {
    return await DynamoDBHelper.getItem(BOOKINGS_TABLE, { bookingId });
  }

  static async _attachUserDetails(bookings) {
    return await Promise.all(bookings.map(async (b) => {
      let clientName = null;
      let clientAvatar = null;
      let hostName = null;
      let hostAvatar = null;
      
      if (b.userId) {
        const user = await DynamoDBHelper.getItem(config.tables.users, { userId: b.userId });
        if (user) {
          clientName = user.displayName;
          clientAvatar = user.avatarUrl;
        }
      }
      
      if (b.hostId) {
        const host = await DynamoDBHelper.getItem(config.tables.users, { userId: b.hostId });
        if (host) {
          hostName = host.displayName;
          hostAvatar = host.avatarUrl;
        }
      }
      
      return {
        ...b,
        clientName: clientName || b.clientName || null,
        clientAvatar: clientAvatar || b.clientAvatar || null,
        hostName: hostName || null,
        hostAvatar: hostAvatar || null,
      };
    }));
  }

  static async getUserBookings(userId, limit = 20) {
    console.log("getUserBookings called with userId:", userId);
    // For MVP/local testing, if UserBookingsIndex is missing, we use scan.
    const params = {
      TableName: BOOKINGS_TABLE,
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    };
    
    const bookings = await DynamoDBHelper.scanItems(params);
    console.log(`Found ${bookings.length} bookings for user ${userId}`);
    const sorted = bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
    return await this._attachUserDetails(sorted);
  }

  static async getHostBookings(hostId, limit = 20) {
    // For MVP/local testing, if HostBookingsIndex is missing, we use scan.
    const params = {
      TableName: BOOKINGS_TABLE,
      FilterExpression: "hostId = :hostId",
      ExpressionAttributeValues: {
        ":hostId": hostId
      }
    };
    
    const bookings = await DynamoDBHelper.scanItems(params);
    const sorted = bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
    return await this._attachUserDetails(sorted);
  }

  static async getBookingRequests() {
    // For MVP, we scan for pending_match. In production, we'd query by GSI (statusIndex) or similar.
    const params = {
      TableName: BOOKINGS_TABLE,
      FilterExpression: "#status = :pending",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":pending": "pending_match" },
    };
    const bookings = await DynamoDBHelper.scanItems(params);
    const sorted = bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return await this._attachUserDetails(sorted);
  }

  static async updateBookingStatus(bookingId, status, updatedByRole, updatedById, reason = null) {
    const now = new Date().toISOString();
    
    // Map frontend "accepted" to our backend DB status
    let dbStatus = status;
    if (status === "accepted") dbStatus = "host_confirmed";

    let updateExpression = "SET #status = :status, updatedAt = :now";
    const expressionAttributeNames = { "#status": "status" };
    const expressionAttributeValues = { ":status": dbStatus, ":now": now };

    if (reason) {
      updateExpression += ", cancelReason = :reason, cancelledBy = :cancelledBy";
      expressionAttributeValues[":reason"] = reason;
      expressionAttributeValues[":cancelledBy"] = updatedByRole;
    }

    if (dbStatus === "host_confirmed") {
      updateExpression += ", confirmedAt = :now";
      // If host accepted it, assign the hostId!
      if (updatedByRole === "host" && updatedById) {
        updateExpression += ", hostId = :hostId";
        expressionAttributeValues[":hostId"] = updatedById;
      }
    }

    const updated = await DynamoDBHelper.updateItem(
      BOOKINGS_TABLE,
      { bookingId },
      updateExpression,
      expressionAttributeNames,
      expressionAttributeValues
    );

    // Notify User
    if (updated && updated.userId) {
      try {
        const user = await DynamoDBHelper.getItem(config.tables.users, { userId: updated.userId });
        if (user && user.fcmToken) {
          let title = "Booking Update";
          let body = `Your booking status changed to ${dbStatus}`;
          
          if (dbStatus === "host_confirmed") {
            title = "Host Assigned!";
            body = "A host has confirmed your booking.";
          } else if (dbStatus === "active") {
            title = "Session Started";
            body = "Your session is now active.";
          } else if (dbStatus === "completed") {
            title = "Session Completed";
            body = "Your session has ended. Please leave a rating.";
          } else if (dbStatus === "cancelled") {
            title = "Booking Cancelled";
            body = "Your booking was cancelled.";
          }

          await FCMClient.sendPushNotification(user.fcmToken, title, body, { type: "booking_update", bookingId });
        }
      } catch (err) {
        console.error("Failed to send FCM to user:", err);
      }
    }

    return updated;
  }

  static async cancelBooking(bookingId, reason, cancelledByRole) {
    const now = new Date().toISOString();
    const updated = await DynamoDBHelper.updateItem(
      BOOKINGS_TABLE,
      { bookingId },
      "SET #status = :status, cancelReason = :reason, cancelledBy = :by, cancelledAt = :now, updatedAt = :now",
      { "#status": "status" },
      { ":status": "cancelled", ":reason": reason, ":by": cancelledByRole, ":now": now }
    );
    return updated;
  }

  /**
   * Get minimal public host info to embed in booking response as assignedHost
   */
  static async getAssignedHostPublic(hostId) {
    if (!hostId) return null;
    const [hostProfile, userProfile] = await Promise.all([
      DynamoDBHelper.getItem(HOSTS_TABLE, { hostId }),
      DynamoDBHelper.getItem(config.tables.users, { userId: hostId }),
    ]);
    if (!hostProfile) return null;
    return {
      hostId,
      displayName: userProfile?.displayName || "Verified Host",
      avatarUrl: userProfile?.avatarUrl || null,
      rating: hostProfile.rating || 0,
      totalReviews: hostProfile.totalReviews || 0,
      languages: hostProfile.languages || [],
      categories: hostProfile.categories || [],
      phone: userProfile?.phone || null,
    };
  }

  /**
   * Host accepts or rejects a booking.
   * On accept  → status: host_confirmed, confirmedAt set, hostId assigned
   * On reject  → add to hostRejections[], increment matchAttempts, reset hostId
   */
  static async handleHostResponse(bookingId, hostId, action, rejectReason = null) {
    const now = new Date().toISOString();
    const booking = await this.getBookingById(bookingId);
    if (!booking) throw new Error("Booking not found");

    if (action === "accept") {
      const updated = await DynamoDBHelper.updateItem(
        BOOKINGS_TABLE,
        { bookingId },
        "SET #status = :status, hostId = :hostId, confirmedAt = :now, updatedAt = :now",
        { "#status": "status" },
        { ":status": "host_confirmed", ":hostId": hostId, ":now": now }
      );

      // Notify user
      try {
        const user = await DynamoDBHelper.getItem(config.tables.users, { userId: booking.userId });
        if (user?.fcmToken) {
          await FCMClient.sendPushNotification(
            user.fcmToken, "Host Confirmed! 🎉",
            "Your host has accepted the booking.",
            { type: "booking_update", bookingId }
          );
        }
      } catch (_) {}

      return updated;
    }

    // REJECT
    const rejections = Array.isArray(booking.hostRejections) ? booking.hostRejections : [];
    rejections.push({ hostId, reason: rejectReason, timestamp: now });
    const newAttempts = (booking.matchAttempts || 0) + 1;

    const updated = await DynamoDBHelper.updateItem(
      BOOKINGS_TABLE,
      { bookingId },
      "SET hostRejections = :rej, matchAttempts = :att, hostId = :null, #status = :status, updatedAt = :now",
      { "#status": "status" },
      {
        ":rej": rejections,
        ":att": newAttempts,
        ":null": null,
        ":status": "pending_assignment",
        ":now": now,
      }
    );

    // Notify user that we're finding another host
    try {
      const user = await DynamoDBHelper.getItem(config.tables.users, { userId: booking.userId });
      if (user?.fcmToken) {
        await FCMClient.sendPushNotification(
          user.fcmToken, "Finding another host...",
          "Your previous host was unavailable. We're finding you a new one.",
          { type: "booking_update", bookingId }
        );
      }
    } catch (_) {}

    return updated;
  }

  /**
   * User requests a host swap — reset hostId and go back to pending_assignment
   */
  static async requestHostSwap(bookingId, userId, reason = null) {
    const now = new Date().toISOString();
    const booking = await this.getBookingById(bookingId);
    if (!booking) throw new Error("Booking not found");

    const rejections = Array.isArray(booking.hostRejections) ? booking.hostRejections : [];
    if (booking.hostId) {
      rejections.push({
        hostId: booking.hostId,
        reason: reason || "User requested host swap",
        timestamp: now,
      });
    }

    const updated = await DynamoDBHelper.updateItem(
      BOOKINGS_TABLE,
      { bookingId },
      "SET hostId = :null, #status = :status, hostRejections = :rej, matchAttempts = :att, updatedAt = :now",
      { "#status": "status" },
      {
        ":null": null,
        ":status": "pending_assignment",
        ":rej": rejections,
        ":att": (booking.matchAttempts || 0) + 1,
        ":now": now,
      }
    );
    return updated;
  }

  /**
   * Admin: get all bookings with optional filters
   */
  static async getAllBookings({ status, userId, hostId, scheduledDate, limit = 20, lastKey } = {}) {
    const filterParts = [];
    const exprNames = {};
    const exprValues = {};

    if (status) {
      filterParts.push("#status = :status");
      exprNames["#status"] = "status";
      exprValues[":status"] = status;
    }
    if (userId) {
      filterParts.push("userId = :userId");
      exprValues[":userId"] = userId;
    }
    if (hostId) {
      filterParts.push("hostId = :hostId");
      exprValues[":hostId"] = hostId;
    }
    if (scheduledDate) {
      filterParts.push("scheduledDate = :date");
      exprValues[":date"] = scheduledDate;
    }

    const params = {
      TableName: BOOKINGS_TABLE,
      Limit: limit,
    };
    if (filterParts.length) {
      params.FilterExpression = filterParts.join(" AND ");
      if (Object.keys(exprNames).length) params.ExpressionAttributeNames = exprNames;
      params.ExpressionAttributeValues = exprValues;
    }
    if (lastKey) {
      try {
        params.ExclusiveStartKey = JSON.parse(Buffer.from(lastKey, "base64").toString("utf8"));
      } catch (_) {}
    }

    const allItems = await DynamoDBHelper.scanItems(params);
    const sorted = allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { items: sorted.slice(0, limit), lastKey: null };
  }
}

module.exports = BookingService;
