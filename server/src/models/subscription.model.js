/**
 * Subscription Model — PlusOne_Subscriptions (Table 7)
 *
 * Active and past user subscriptions.
 *
 * | Attribute           | Type          | Description                       |
 * |---------------------|---------------|-----------------------------------|
 * | subscriptionId (PK) | String (UUID) | Unique subscription ID            |
 * | userId              | String        | User who subscribed               |
 * | planId              | String        | Reference to PricingPlans         |
 * | status              | String        | active / expired / cancelled      |
 * | startDate           | String (ISO)  | Subscription start timestamp      |
 * | endDate             | String (ISO)  | Subscription end timestamp        |
 * | hoursRemaining      | Number        | Balance hours                     |
 * | kmRemaining         | Number        | Balance KM                        |
 * | autoRenew           | Boolean       | Auto-renewal preference           |
 * | paymentId           | String        | Razorpay payment ID               |
 * | price               | Number        | Amount paid (INR)                 |
 * | razorpayOrderId     | String        | Related Razorpay order ID         |
 * | createdAt           | String (ISO)  | Creation timestamp                |
 * | updatedAt           | String (ISO)  | Last updated timestamp            |
 *
 * GSIs:
 * 1. UserSubscriptionIndex: PK userId, SK createdAt
 * 2. StatusEndDateIndex: PK status, SK endDate
 * 3. UserActiveIndex: PK userId, SK status
 */

const { v4: uuidv4 } = require("uuid");

const SUBSCRIPTION_STATUSES = {
  ACTIVE: "active",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
};

/**
 * Formats and normalizes a Subscription document for DynamoDB
 * @param {Object} payload
 * @returns {Object} normalized subscription item
 */
function formatSubscriptionModel(payload) {
  const now = new Date().toISOString();

  return {
    subscriptionId: payload.subscriptionId || uuidv4(),
    userId: payload.userId,
    planId: payload.planId,
    status: payload.status || SUBSCRIPTION_STATUSES.ACTIVE,
    startDate: payload.startDate || now,
    endDate: payload.endDate,
    hoursRemaining: Number(payload.hoursRemaining) || 0,
    kmRemaining: Number(payload.kmRemaining) || 0,
    autoRenew: typeof payload.autoRenew === "boolean" ? payload.autoRenew : true,
    paymentId: payload.paymentId || null,
    price: Number(payload.price) || 0,
    razorpayOrderId: payload.razorpayOrderId || null,
    createdAt: payload.createdAt || now,
    updatedAt: now,
  };
}

/**
 * Formats subscription object for API responses matching Section 6.9 documentation
 * @param {Object} subscription
 * @param {Object} extra Additional fields (e.g. razorpayOrderId)
 * @returns {Object} formatted response data
 */
function formatSubscriptionResponse(subscription, extra = {}) {
  if (!subscription) return null;

  return {
    subscriptionId: subscription.subscriptionId,
    planId: subscription.planId,
    status: subscription.status,
    hoursRemaining: subscription.hoursRemaining,
    kmRemaining: subscription.kmRemaining,
    startDate: subscription.startDate ? subscription.startDate.split("T")[0] : null,
    endDate: subscription.endDate ? subscription.endDate.split("T")[0] : null,
    autoRenew: subscription.autoRenew,
    price: subscription.price,
    razorpayOrderId: extra.razorpayOrderId || subscription.razorpayOrderId || null,
  };
}

module.exports = {
  SUBSCRIPTION_STATUSES,
  formatSubscriptionModel,
  formatSubscriptionResponse,
};
