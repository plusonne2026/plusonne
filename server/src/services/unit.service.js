const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");
const { v4: uuidv4 } = require("uuid");
const { formatUnitBalanceModel, formatUnitBalanceResponse } = require("../models/unit.model");
const SettingService = require("./setting.service");
const BillingService = require("./billing.service");
const FCMClient = require("../clients/fcm.client");

const UNIT_BALANCES_TABLE = config.tables.unitBalances;
const PAYMENTS_TABLE = config.tables.payments;
const BOOKINGS_TABLE = config.tables.bookings;
const USERS_TABLE = config.tables.users;

class UnitService {
  /**
   * Get a user's unit balance matching Table 8 schema
   * @param {string} userId 
   */
  static async getUserBalance(userId) {
    const balance = await DynamoDBHelper.getItem(UNIT_BALANCES_TABLE, { userId });
    
    if (!balance) {
      // Return 0 balances if no record exists
      return formatUnitBalanceResponse({
        userId,
        hoursBalance: 0,
        kmBalance: 0,
        totalHoursPurchased: 0,
        totalKmPurchased: 0,
        totalHoursUsed: 0,
        totalKmUsed: 0,
        lastUpdated: new Date().toISOString(),
      });
    }

    return formatUnitBalanceResponse(balance);
  }

  /**
   * POST /units/purchase
   * Purchase time or distance units matching Section 6.10 documentation
   * 
   * @param {string} userId
   * @param {Object} payload { type: "hours"|"km", amount: number, pricePerUnit?: number, autoCredit?: boolean }
   */
  static async purchaseUnits(userId, { type, amount, pricePerUnit, autoCredit = true }) {
    if (!type || !["hours", "km"].includes(type.toLowerCase())) {
      throw new Error('Valid unit type is required ("hours" or "km")');
    }

    const unitType = type.toLowerCase();
    const qty = Number(amount);
    if (!qty || qty <= 0) {
      throw new Error("Amount must be a positive number");
    }

    // 1. Get current server-side pricing
    const currentPrices = await SettingService.getUnitPrices();
    const serverRate = unitType === "hours" ? (currentPrices.hourPrice || 200) : (currentPrices.kmPrice || 15);
    const effectiveRate = Number(pricePerUnit) > 0 ? Number(pricePerUnit) : serverRate;
    const totalPrice = Math.round(qty * effectiveRate);

    // 2. Create Razorpay order
    const receiptId = `unit_${userId.substring(0, 8)}_${Date.now()}`;
    let razorpayOrderId = null;
    try {
      const order = await BillingService.createOrder(totalPrice, receiptId);
      razorpayOrderId = order?.id || null;
    } catch (err) {
      console.warn("[UnitService] Failed to create Razorpay order:", err.message);
      razorpayOrderId = `order_unit_${uuidv4().replace(/-/g, "").substring(0, 14)}`;
    }

    // 3. Update Unit Balances (if autoCredit is enabled)
    let updatedBalance = null;
    if (autoCredit) {
      const hoursToAdd = unitType === "hours" ? qty : 0;
      const kmToAdd = unitType === "km" ? qty : 0;
      updatedBalance = await this.adjustUserBalance(userId, hoursToAdd, kmToAdd);

      // 4. Record transaction in payments table
      try {
        const paymentRecord = {
          paymentId: `tx_unit_${uuidv4()}`,
          userId,
          type: "unit_purchase",
          amount: totalPrice,
          currency: "INR",
          status: "success",
          razorpayOrderId,
          description: `Purchased ${qty} ${unitType}`,
          metadata: {
            unitType,
            amount: qty,
            pricePerUnit: effectiveRate,
          },
          createdAt: new Date().toISOString(),
        };
        await DynamoDBHelper.putItem(PAYMENTS_TABLE, paymentRecord);
      } catch (logErr) {
        console.warn("[UnitService] Failed to record payment transaction:", logErr.message);
      }
    }

    // 5. Notify user via FCM
    try {
      const user = await DynamoDBHelper.getItem(USERS_TABLE, { userId });
      if (user?.fcmToken) {
        await FCMClient.sendPushNotification(
          user.fcmToken,
          "Units Added to Wallet! ⚡",
          `${qty} ${unitType} added to your balance!`,
          { type: "unit_recharge", unitType, amount: qty }
        );
      }
    } catch (_) {}

    return {
      razorpayOrderId,
      purchase: {
        type: unitType,
        amount: qty,
        totalPrice,
      },
      balance: updatedBalance,
    };
  }

  /**
   * GET /units/history
   * Get unit-specific purchase and usage history
   * @param {string} userId 
   */
  static async getUnitHistory(userId) {
    const history = [];

    // 1. Fetch unit purchases from payments table
    try {
      const paymentParams = {
        TableName: PAYMENTS_TABLE,
        IndexName: "UserIndex",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
      };
      let payments = [];
      try {
        payments = await DynamoDBHelper.queryItems(paymentParams);
      } catch (_) {
        // Fallback scan if GSI is not configured
        payments = await DynamoDBHelper.scanItems({
          TableName: PAYMENTS_TABLE,
          FilterExpression: "userId = :uid",
          ExpressionAttributeValues: { ":uid": userId },
        });
      }

      if (payments && payments.length > 0) {
        payments
          .filter((p) => p.type === "unit_purchase" || p.metadata?.unitType)
          .forEach((p) => {
            history.push({
              id: p.paymentId || p.transactionId,
              type: "purchase",
              unitType: p.metadata?.unitType || (p.description?.includes("hours") ? "hours" : "km"),
              amount: p.metadata?.amount || 0,
              totalPrice: p.amount || 0,
              status: p.status || "success",
              razorpayOrderId: p.razorpayOrderId || null,
              description: p.description || "Unit Purchase",
              timestamp: p.createdAt,
            });
          });
      }
    } catch (err) {
      console.warn("[UnitService] Error fetching payment history:", err.message);
    }

    // 2. Fetch unit usage from bookings table (where pricingModel = "unit")
    try {
      let bookings = [];
      try {
        bookings = await DynamoDBHelper.queryItems({
          TableName: BOOKINGS_TABLE,
          IndexName: "UserBookingsIndex",
          KeyConditionExpression: "userId = :uid",
          ExpressionAttributeValues: { ":uid": userId },
        });
      } catch (_) {
        bookings = await DynamoDBHelper.scanItems({
          TableName: BOOKINGS_TABLE,
          FilterExpression: "userId = :uid",
          ExpressionAttributeValues: { ":uid": userId },
        });
      }

      if (bookings && bookings.length > 0) {
        bookings
          .filter((b) => b.pricingModel === "unit")
          .forEach((b) => {
            history.push({
              id: b.bookingId,
              type: "usage",
              unitType: "hours",
              amount: b.price?.overage || 1,
              totalPrice: 0,
              status: b.status,
              bookingId: b.bookingId,
              description: `Booking #${b.bookingId.substring(0, 8)} (${b.status})`,
              timestamp: b.completedAt || b.createdAt,
            });
          });
      }
    } catch (err) {
      console.warn("[UnitService] Error fetching booking unit usage:", err.message);
    }

    // 3. Sort newest first
    return history.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  }

  /**
   * Manually credit or deduct units from a user's wallet (Admin or Purchase Action)
   */
  static async adjustUserBalance(userId, hoursAmount = 0, kmAmount = 0) {
    const now = new Date().toISOString();
    const h = Number(hoursAmount) || 0;
    const k = Number(kmAmount) || 0;

    // Fetch existing or initialize
    let current = await DynamoDBHelper.getItem(UNIT_BALANCES_TABLE, { userId });
    if (!current) {
      current = formatUnitBalanceModel({
        userId,
        hoursBalance: 0,
        kmBalance: 0,
        totalHoursPurchased: 0,
        totalKmPurchased: 0,
        totalHoursUsed: 0,
        totalKmUsed: 0,
      });
      await DynamoDBHelper.putItem(UNIT_BALANCES_TABLE, current);
    }

    const newHoursBalance = Math.max(0, (current.hoursBalance || 0) + h);
    const newKmBalance = Math.max(0, (current.kmBalance || 0) + k);
    const newTotalHoursPurchased = (current.totalHoursPurchased || 0) + (h > 0 ? h : 0);
    const newTotalKmPurchased = (current.totalKmPurchased || 0) + (k > 0 ? k : 0);
    const newTotalHoursUsed = (current.totalHoursUsed || 0) + (h < 0 ? Math.abs(h) : 0);
    const newTotalKmUsed = (current.totalKmUsed || 0) + (k < 0 ? Math.abs(k) : 0);

    const updated = await DynamoDBHelper.updateItem(
      UNIT_BALANCES_TABLE,
      { userId },
      "SET hoursBalance = :hb, kmBalance = :kb, totalHoursPurchased = :thp, totalKmPurchased = :tkp, totalHoursUsed = :thu, totalKmUsed = :tku, lastUpdated = :now",
      undefined,
      {
        ":hb": newHoursBalance,
        ":kb": newKmBalance,
        ":thp": newTotalHoursPurchased,
        ":tkp": newTotalKmPurchased,
        ":thu": newTotalHoursUsed,
        ":tku": newTotalKmUsed,
        ":now": now,
      }
    );

    return formatUnitBalanceResponse(updated);
  }
}

module.exports = UnitService;
