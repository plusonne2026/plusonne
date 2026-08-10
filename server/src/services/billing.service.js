const Razorpay = require("razorpay");
const crypto = require("crypto");
const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");
const { v4: uuidv4 } = require("uuid");

const PAYMENTS_TABLE = config.tables.payments;

const razorpayInstance = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

class BillingService {
  /**
   * Generates a Razorpay Order
   * @param {number} amount in INR (rupees)
   * @param {string} receiptId typically the booking ID
   * @returns {Promise<Object>} Razorpay Order Object
   */
  static async createOrder(amountInRupees, receiptId) {
    const options = {
      amount: Math.round(amountInRupees * 100), // convert to paise
      currency: "INR",
      receipt: receiptId,
      payment_capture: 1, // Auto capture
    };

    // If using a dummy key, mock the Razorpay API response
    if (config.razorpay.keyId === "rzp_test_dummykey12345" || !config.razorpay.keyId) {
      console.log("Using Mock Razorpay Order since key is dummy");
      return {
        id: `order_mock_${uuidv4().replace(/-/g, '').substring(0, 14)}`,
        entity: "order",
        amount: options.amount,
        amount_paid: 0,
        amount_due: options.amount,
        currency: "INR",
        receipt: receiptId,
        status: "created",
        attempts: 0,
        created_at: Math.floor(Date.now() / 1000)
      };
    }

    try {
      const order = await razorpayInstance.orders.create(options);
      return order;
    } catch (error) {
      console.error("Razorpay Order Creation Failed:", error);
      throw new Error("Failed to create payment order");
    }
  }

  /**
   * Verifies the Razorpay signature
   */
  static verifySignature(orderId, paymentId, signature) {
    if (config.razorpay.keyId === "rzp_test_dummykey12345" || !config.razorpay.keyId) {
      console.log("Mocking Razorpay Signature Verification");
      return true;
    }

    const hmac = crypto.createHmac("sha256", config.razorpay.keySecret);
    hmac.update(orderId + "|" + paymentId);
    const generatedSignature = hmac.digest("hex");
    return generatedSignature === signature;
  }

  /**
   * Saves payment record to DynamoDB
   */
  static async recordPayment(paymentDetails) {
    const payment = {
      paymentId: paymentDetails.paymentId, // Razorpay payment ID
      orderId: paymentDetails.orderId,
      bookingId: paymentDetails.bookingId,
      userId: paymentDetails.userId,
      amount: paymentDetails.amount, // in rupees
      status: paymentDetails.status, // "success", "failed", "refunded"
      method: paymentDetails.method || "razorpay",
      createdAt: new Date().toISOString(),
    };

    await DynamoDBHelper.putItem(PAYMENTS_TABLE, payment);
    return payment;
  }
}

module.exports = BillingService;
