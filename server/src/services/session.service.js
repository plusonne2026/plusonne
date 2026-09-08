const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");
const { getFirebaseDatabase } = require("../config/firebase.config");
const FCMClient = require("../clients/fcm.client");
const {
  formatSessionModel,
  calculateTotalDistance,
} = require("../models/session.model");

const SESSIONS_TABLE = config.tables.sessions;
const BOOKINGS_TABLE = config.tables.bookings;
const PACKAGES_TABLE = config.tables.packages;
const USERS_TABLE = config.tables.users;

class SessionService {
  // ────────────────────────────────────────────────────────────
  //  Create / Initialize a session record (called when host accepts)
  // ────────────────────────────────────────────────────────────
  /**
   * Creates an initial session record with status "awaiting_host".
   * Called internally when host accepts a booking (host-response → accept).
   * @param {string} bookingId
   * @param {Object} extras  Optional overrides (includedHours, includedKm)
   */
  static async createSession(bookingId, extras = {}) {
    let includedHours = extras.includedHours || 0;
    let includedKm = extras.includedKm || 0;

    if (!includedHours && !includedKm) {
      try {
        const booking = await DynamoDBHelper.getItem(BOOKINGS_TABLE, { bookingId });
        if (booking?.packageId) {
          const pkg = await DynamoDBHelper.getItem(PACKAGES_TABLE, { packageId: booking.packageId });
          if (pkg) {
            includedHours = pkg.durationHours || 0;
            includedKm = pkg.distanceKm || 0;
          }
        }
      } catch (err) {
        console.warn(`[SessionService] Could not pre-fetch package limits for ${bookingId}:`, err.message);
      }
    }

    const session = formatSessionModel({
      bookingId,
      status: "awaiting_host",
      includedHours,
      includedKm,
    });

    await DynamoDBHelper.putItem(SESSIONS_TABLE, session);
    console.log(`[SessionService] Session created for booking ${bookingId}`);
    return session;
  }

  // ────────────────────────────────────────────────────────────
  //  POST /sessions/:bookingId/start
  // ────────────────────────────────────────────────────────────
  /**
   * Start a session. Documentation operations:
   * 1. Verify booking status is "host_confirmed"
   * 2. Verify caller is the assigned host
   * 3. Update Session: status → in_progress, startTime, startLocation
   * 4. Update Booking: status → active, startedAt
   * 5. Write to Firebase RTDB: /sessions/{bookingId}/status = "in_progress"
   * 6. Notify user: "Your session has started!"
   * 7. Log in AuditLogs (TODO)
   */
  static async startSession(bookingId, hostId, location) {
    // 1. Get booking and verify status
    const booking = await DynamoDBHelper.getItem(BOOKINGS_TABLE, { bookingId });
    if (!booking) throw new Error("Booking not found");

    if (booking.status !== "host_confirmed") {
      throw new Error(`Cannot start session: booking status is "${booking.status}", expected "host_confirmed"`);
    }

    // 2. Verify caller is assigned host
    if (booking.hostId !== hostId) {
      throw new Error("Only the assigned host can start the session");
    }

    const now = new Date().toISOString();
    const startLocation = {
      lat: location?.lat || null,
      lng: location?.lng || null,
      address: location?.address || "",
    };

    // Fetch package details for includedHours / includedKm
    let includedHours = 0;
    let includedKm = 0;
    if (booking.packageId) {
      const pkg = await DynamoDBHelper.getItem(PACKAGES_TABLE, { packageId: booking.packageId });
      if (pkg) {
        includedHours = pkg.durationHours || 0;
        includedKm = pkg.distanceKm || 0;
      }
    }

    // 3. Update Session
    let session = await DynamoDBHelper.getItem(SESSIONS_TABLE, { bookingId });
    if (!session) {
      // Session record not created yet — create it now
      session = formatSessionModel({
        bookingId,
        status: "in_progress",
        startTime: now,
        startLocation,
        includedHours,
        includedKm,
        routePoints: [{ lat: startLocation.lat, lng: startLocation.lng, timestamp: now }],
      });
      await DynamoDBHelper.putItem(SESSIONS_TABLE, session);
    } else {
      // Update existing session
      const updatedSession = await DynamoDBHelper.updateItem(
        SESSIONS_TABLE,
        { bookingId },
        "SET #status = :status, startTime = :startTime, startLocation = :startLoc, includedHours = :incH, includedKm = :incKm, routePoints = :rp, updatedAt = :now",
        { "#status": "status" },
        {
          ":status": "in_progress",
          ":startTime": now,
          ":startLoc": startLocation,
          ":incH": includedHours,
          ":incKm": includedKm,
          ":rp": [{ lat: startLocation.lat, lng: startLocation.lng, timestamp: now }],
          ":now": now,
        }
      );
      session = updatedSession;
    }

    // 4. Update Booking: status → active, startedAt
    await DynamoDBHelper.updateItem(
      BOOKINGS_TABLE,
      { bookingId },
      "SET #status = :status, startedAt = :now, updatedAt = :now",
      { "#status": "status" },
      { ":status": "active", ":now": now }
    );

    // 5. Write to Firebase RTDB
    try {
      const db = getFirebaseDatabase();
      if (db) {
        await db.ref(`sessions/${bookingId}`).set({
          status: "in_progress",
          hostLocation: {
            lat: startLocation.lat,
            lng: startLocation.lng,
            updatedAt: Date.now(),
          },
          startedAt: Date.now(),
        });
      }
    } catch (err) {
      console.warn("[SessionService] RTDB write failed (non-critical):", err.message);
    }

    // 6. Notify user
    try {
      const user = await DynamoDBHelper.getItem(USERS_TABLE, { userId: booking.userId });
      if (user?.fcmToken) {
        await FCMClient.sendPushNotification(
          user.fcmToken,
          "Session Started! 🎉",
          "Your session has started!",
          { type: "session_started", bookingId }
        );
      }
    } catch (err) {
      console.warn("[SessionService] FCM notification failed:", err.message);
    }

    // Ensure session object has correct values for response
    session.status = "in_progress";
    session.startTime = now;
    session.startLocation = startLocation;
    session.includedHours = includedHours;
    session.includedKm = includedKm;

    return session;
  }

  // ────────────────────────────────────────────────────────────
  //  POST /sessions/:bookingId/end
  // ────────────────────────────────────────────────────────────
  /**
   * End a session. Documentation operations (CRITICAL — atomic):
   * 1. Verify booking is active, caller is assigned host
   * 2. Calculate total time = endTime - startTime
   * 3. Calculate total distance from route points (Haversine)
   * 4. Calculate overage (package/unit/subscription)
   * 5. Update Session: status → completed, all metrics, finalBill
   * 6. Update Booking: status → completed, completedAt, price.total
   * 7-9. Create overage transaction, update unit/subscription balances (TODO for advanced billing)
   * 10. Clean up Firebase RTDB
   * 11. Notify both parties
   * 12. Log in AuditLogs (TODO)
   */
  static async endSession(bookingId, hostId, location, chatMessages = []) {
    // 1. Verify booking
    const booking = await DynamoDBHelper.getItem(BOOKINGS_TABLE, { bookingId });
    if (!booking) throw new Error("Booking not found");

    if (booking.status !== "active") {
      throw new Error(`Cannot end session: booking status is "${booking.status}", expected "active"`);
    }

    if (booking.hostId !== hostId) {
      throw new Error("Only the assigned host can end the session");
    }

    // Get session record
    let session = await DynamoDBHelper.getItem(SESSIONS_TABLE, { bookingId });
    if (!session) {
      throw new Error("Session record not found for this booking");
    }

    const now = new Date().toISOString();
    const endLocation = {
      lat: location?.lat || null,
      lng: location?.lng || null,
      address: location?.address || "",
    };

    // Append end location to route points
    const routePoints = Array.isArray(session.routePoints) ? [...session.routePoints] : [];
    routePoints.push({ lat: endLocation.lat, lng: endLocation.lng, timestamp: now });

    // 2. Calculate total time
    const startMs = new Date(session.startTime).getTime();
    const endMs = new Date(now).getTime();
    const totalTimeMinutes = Math.round((endMs - startMs) / 60000);

    // 3. Calculate total distance (Haversine)
    const totalDistanceKm = calculateTotalDistance(routePoints);

    // 4. Calculate overage
    const includedHours = session.includedHours || 0;
    const includedKm = session.includedKm || 0;
    const totalHours = totalTimeMinutes / 60;

    const overageHours = Math.max(0, Math.round((totalHours - includedHours) * 100) / 100);
    const overageKm = Math.max(0, Math.round((totalDistanceKm - includedKm) * 100) / 100);

    // Get package rates for overage calculation
    let perExtraHour = 200; // default
    let perExtraKm = 15;    // default
    let basePrice = 0;

    if (booking.packageId) {
      const pkg = await DynamoDBHelper.getItem(PACKAGES_TABLE, { packageId: booking.packageId });
      if (pkg) {
        perExtraHour = pkg.extraCharges?.perExtraHour || perExtraHour;
        perExtraKm = pkg.extraCharges?.perExtraKm || perExtraKm;
        basePrice = pkg.basePrice || 0;
      }
    }

    // Use booking's base price if available
    if (booking.price?.base) {
      basePrice = booking.price.base;
    }

    const overageTime = Math.round(overageHours * perExtraHour * 100) / 100;
    const overageDistance = Math.round(overageKm * perExtraKm * 100) / 100;
    const overageCharges = overageTime + overageDistance;

    // Apply subscription discount if applicable
    let discount = 0;
    if (booking.pricingModel === "subscription" && overageCharges > 0) {
      discount = Math.round(overageCharges * 0.20 * 100) / 100; // 20% discount
    }

    const finalBill = {
      base: basePrice,
      overageTime,
      overageDistance,
      discount,
      total: Math.round((basePrice + overageCharges - discount) * 100) / 100,
      currency: "INR",
    };

    // 5. Update Session
    const updatedSession = await DynamoDBHelper.updateItem(
      SESSIONS_TABLE,
      { bookingId },
      "SET #status = :status, endTime = :endTime, endLocation = :endLoc, totalDistanceKm = :dist, totalTimeMinutes = :time, overageHours = :oH, overageKm = :oKm, overageCharges = :oC, finalBill = :bill, routePoints = :rp, updatedAt = :now",
      { "#status": "status" },
      {
        ":status": "completed",
        ":endTime": now,
        ":endLoc": endLocation,
        ":dist": totalDistanceKm,
        ":time": totalTimeMinutes,
        ":oH": overageHours,
        ":oKm": overageKm,
        ":oC": overageCharges,
        ":bill": finalBill,
        ":rp": routePoints,
        ":now": now,
      }
    );

    // 6. Update Booking: status → completed, completedAt, price.total
    const updatedPrice = {
      ...booking.price,
      overage: overageCharges,
      total: finalBill.total,
    };

    await DynamoDBHelper.updateItem(
      BOOKINGS_TABLE,
      { bookingId },
      "SET #status = :status, completedAt = :now, price = :price, updatedAt = :now",
      { "#status": "status" },
      {
        ":status": "completed",
        ":now": now,
        ":price": updatedPrice,
      }
    );

    // 10. Clean up Firebase RTDB
    try {
      const db = getFirebaseDatabase();
      if (db) {
        await db.ref(`sessions/${bookingId}`).remove();
      }
    } catch (err) {
      console.warn("[SessionService] RTDB cleanup failed (non-critical):", err.message);
    }

    // 11. Notify both parties
    try {
      const user = await DynamoDBHelper.getItem(USERS_TABLE, { userId: booking.userId });
      if (user?.fcmToken) {
        await FCMClient.sendPushNotification(
          user.fcmToken,
          "Session Completed! ⭐",
          "Session completed! Please rate your experience.",
          { type: "session_completed", bookingId }
        );
      }
    } catch (err) {
      console.warn("[SessionService] FCM to user failed:", err.message);
    }

    try {
      const hostUser = await DynamoDBHelper.getItem(USERS_TABLE, { userId: hostId });
      if (hostUser?.fcmToken) {
        await FCMClient.sendPushNotification(
          hostUser.fcmToken,
          "Session Completed! ⭐",
          "Session completed! Please rate your experience.",
          { type: "session_completed", bookingId }
        );
      }
    } catch (err) {
      console.warn("[SessionService] FCM to host failed:", err.message);
    }

    // Build response object
    const responseSession = {
      bookingId,
      status: "completed",
      startTime: session.startTime,
      endTime: now,
      totalTimeMinutes,
      totalDistanceKm,
      includedHours,
      includedKm,
      overageHours,
      overageKm,
      overageCharges,
      finalBill,
      routePoints,
    };

    return responseSession;
  }

  // ────────────────────────────────────────────────────────────
  //  PUT /sessions/:bookingId/location
  // ────────────────────────────────────────────────────────────
  /**
   * Update location during active session.
   * Appends point to routePoints and updates RTDB.
   */
  static async updateLocation(bookingId, userId, role, location) {
    const booking = await DynamoDBHelper.getItem(BOOKINGS_TABLE, { bookingId });
    if (!booking) throw new Error("Booking not found");

    if (booking.status !== "active") {
      throw new Error("Cannot update location: session is not active");
    }

    // Verify participant
    if (booking.userId !== userId && booking.hostId !== userId) {
      throw new Error("Only participants can update location");
    }

    const now = new Date().toISOString();
    const point = {
      lat: location.lat,
      lng: location.lng,
      timestamp: now,
    };

    // Append to routePoints in session (only host route tracking per docs)
    const session = await DynamoDBHelper.getItem(SESSIONS_TABLE, { bookingId });
    if (session) {
      const routePoints = Array.isArray(session.routePoints) ? [...session.routePoints, point] : [point];
      await DynamoDBHelper.updateItem(
        SESSIONS_TABLE,
        { bookingId },
        "SET routePoints = :rp, updatedAt = :now",
        undefined,
        { ":rp": routePoints, ":now": now }
      );
    }

    // Update RTDB live location
    try {
      const db = getFirebaseDatabase();
      if (db) {
        const locationKey = role === "host" ? "hostLocation" : "userLocation";
        await db.ref(`sessions/${bookingId}/${locationKey}`).set({
          lat: location.lat,
          lng: location.lng,
          updatedAt: Date.now(),
        });
      }
    } catch (err) {
      console.warn("[SessionService] RTDB location update failed:", err.message);
    }

    return { bookingId, location: point, updated: true };
  }

  // ────────────────────────────────────────────────────────────
  //  GET /sessions/:bookingId
  // ────────────────────────────────────────────────────────────
  /**
   * Get session details.
   */
  static async getSession(bookingId) {
    const session = await DynamoDBHelper.getItem(SESSIONS_TABLE, { bookingId });
    if (!session) throw new Error("Session not found");
    return session;
  }

  // ────────────────────────────────────────────────────────────
  //  GET /sessions/:bookingId/route
  // ────────────────────────────────────────────────────────────
  /**
   * Get route history — returns route points and total distance.
   */
  static async getRouteHistory(bookingId) {
    const session = await DynamoDBHelper.getItem(SESSIONS_TABLE, { bookingId });
    if (!session) throw new Error("Session not found");

    return {
      bookingId: session.bookingId,
      routePoints: session.routePoints || [],
      totalDistanceKm: session.totalDistanceKm || calculateTotalDistance(session.routePoints),
      status: session.status,
    };
  }

  // ────────────────────────────────────────────────────────────
  //  GET /sessions/active
  // ────────────────────────────────────────────────────────────
  /**
   * Get all active sessions (admin only).
   * Uses scan with filter for MVP; production would use ActiveSessionsIndex GSI.
   */
  static async getActiveSessions() {
    try {
      const params = {
        TableName: SESSIONS_TABLE,
        IndexName: "ActiveSessionsIndex",
        KeyConditionExpression: "#status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": "in_progress" },
        ScanIndexForward: false,
      };
      return await DynamoDBHelper.queryItems(params);
    } catch (err) {
      // Fallback to scan if GSI is not available
      const params = {
        TableName: SESSIONS_TABLE,
        FilterExpression: "#status = :active",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":active": "in_progress" },
      };
      return await DynamoDBHelper.scanItems(params);
    }
  }
}

module.exports = SessionService;
