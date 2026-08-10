const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");
const { v4: uuidv4 } = require("uuid");

const BOOKINGS_TABLE = config.tables.bookings;
const PACKAGES_TABLE = config.tables.packages;
const HOSTS_TABLE = config.tables.hosts;

class BookingService {
  static async createBooking(userId, payload) {
    const bookingId = uuidv4();
    const now = new Date().toISOString();
    
    // In a real implementation, price calculation happens here
    // based on the package/units. We'll mock the price object for MVP.
    const price = {
      base: 1000,
      extras: 0,
      discount: 0,
      tax: 180,
      total: 1180,
      currency: "INR"
    };

    const booking = {
      bookingId,
      userId,
      hostId: null, // assigned later or picked from matching
      ...payload,
      status: "pending_payment", // Initial status
      price,
      matchAttempts: 0,
      createdAt: now,
      updatedAt: now,
    };

    await DynamoDBHelper.putItem(BOOKINGS_TABLE, booking);
    return booking;
  }

  static async getBookingById(bookingId) {
    return await DynamoDBHelper.getItem(BOOKINGS_TABLE, { bookingId });
  }

  static async getUserBookings(userId, limit = 20) {
    const params = {
      TableName: BOOKINGS_TABLE,
      IndexName: "UserBookingsIndex",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      },
      Limit: limit
    };
    
    const bookings = await DynamoDBHelper.queryItems(params);
    return bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async getHostBookings(hostId, limit = 20) {
    const params = {
      TableName: BOOKINGS_TABLE,
      IndexName: "HostBookingsIndex",
      KeyConditionExpression: "hostId = :hostId",
      ExpressionAttributeValues: {
        ":hostId": hostId
      },
      Limit: limit
    };
    
    const bookings = await DynamoDBHelper.queryItems(params);
    return bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async updateBookingStatus(bookingId, status, updatedByRole, updatedById, reason = null) {
    const now = new Date().toISOString();
    let updateExpression = "SET #status = :status, updatedAt = :now";
    const expressionAttributeNames = { "#status": "status" };
    const expressionAttributeValues = { ":status": status, ":now": now };

    if (reason) {
      updateExpression += ", cancelReason = :reason, cancelledBy = :cancelledBy";
      expressionAttributeValues[":reason"] = reason;
      expressionAttributeValues[":cancelledBy"] = updatedByRole;
    }

    if (status === "host_confirmed") {
      updateExpression += ", confirmedAt = :now";
    }

    const updated = await DynamoDBHelper.updateItem(
      BOOKINGS_TABLE,
      { bookingId },
      updateExpression,
      expressionAttributeNames,
      expressionAttributeValues
    );
    return updated;
  }

  static async cancelBooking(bookingId, reason, cancelledByRole) {
    return await this.updateBookingStatus(bookingId, "cancelled", cancelledByRole, null, reason);
  }
}

module.exports = BookingService;
