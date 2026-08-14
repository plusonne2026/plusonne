const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");
const { v4: uuidv4 } = require("uuid");

const BOOKINGS_TABLE = config.tables.bookings;
const PACKAGES_TABLE = config.tables.packages;
const HOSTS_TABLE = config.tables.hosts;

const UnitService = require("./unit.service");
const FCMClient = require("../clients/fcm.client");

class BookingService {
  static async createBooking(userId, payload) {
    const bookingId = uuidv4();
    const now = new Date().toISOString();
    
    // Fetch package to calculate dynamic hours & price
    const pkg = await DynamoDBHelper.getItem(PACKAGES_TABLE, { packageId: payload.packageId });
    if (!pkg) throw new Error("Package not found");

    const durationHours = pkg.durationHours || 1;
    let status = "pending_payment"; // default for package/cash

    // If wallet pricing, verify and deduct hours
    if (payload.pricingModel === "unit") {
      const userBalance = await UnitService.getUserBalance(userId);
      if (userBalance.hoursBalance < durationHours) {
        throw new Error(`Insufficient wallet balance. You need at least ${durationHours} hours.`);
      }
      
      // Deduct hours immediately
      await UnitService.adjustUserBalance(userId, -durationHours, 0);
      status = "pending_match"; // Wallet payment is immediate, skip to matching
    }

    const price = {
      base: pkg.basePrice || 1000,
      extras: 0,
      discount: 0,
      tax: Math.round((pkg.basePrice || 1000) * 0.18),
      total: Math.round((pkg.basePrice || 1000) * 1.18),
      currency: "INR"
    };

    const booking = {
      bookingId,
      userId,
      hostId: payload.hostId || null, // assigned later or picked from matching
      ...payload,
      status, 
      price,
      matchAttempts: 0,
      createdAt: now,
      updatedAt: now,
    };

    await DynamoDBHelper.putItem(BOOKINGS_TABLE, booking);

    // Notify Host if assigned
    if (booking.hostId) {
      try {
        const hostUser = await DynamoDBHelper.getItem(config.tables.users, { userId: booking.hostId });
        if (hostUser && hostUser.fcmToken) {
          await FCMClient.sendPushNotification(
            hostUser.fcmToken,
            "New Booking Request!",
            "A user has requested a session with you.",
            { type: "booking_request", bookingId }
          );
        }
      } catch (err) {
        console.error("Failed to send FCM to host:", err);
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
    return await this.updateBookingStatus(bookingId, "cancelled", cancelledByRole, null, reason);
  }
}

module.exports = BookingService;
