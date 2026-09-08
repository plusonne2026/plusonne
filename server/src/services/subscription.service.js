const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");
const { v4: uuidv4 } = require("uuid");
const {
  SUBSCRIPTION_STATUSES,
  formatSubscriptionModel,
} = require("../models/subscription.model");
const PlanService = require("./plan.service");
const BillingService = require("./billing.service");
const FCMClient = require("../clients/fcm.client");

const SUBSCRIPTIONS_TABLE = config.tables.subscriptions;
const PLANS_TABLE = config.tables.pricingPlans;
const USERS_TABLE = config.tables.users;

class SubscriptionService {
  /**
   * GET /subscriptions/plans
   * List all available active subscription plans
   */
  static async getAvailablePlans() {
    return await PlanService.getAllPlans(false);
  }

  /**
   * POST /subscriptions/subscribe
   * Subscribe user to a plan & create Razorpay payment order
   */
  static async subscribeToPlan(userId, { planId, autoRenew = true }) {
    if (!planId) {
      throw new Error("planId is required");
    }

    // 1. Check if user already has an active subscription
    const existingActive = await this.getMyActiveSubscription(userId);
    if (existingActive) {
      throw new Error("You already have an active subscription. Please cancel it before subscribing to a new one.");
    }

    // 2. Fetch plan details
    const plan = await DynamoDBHelper.getItem(PLANS_TABLE, { planId });
    if (!plan) {
      throw new Error(`Plan "${planId}" not found`);
    }

    if (!plan.isActive) {
      throw new Error("This plan is currently not available for subscription");
    }

    const subscriptionId = uuidv4();
    const now = new Date();
    const startDate = now.toISOString();

    // Default 30-day billing cycle for subscriptions
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // 3. Create Razorpay Order
    let razorpayOrderId = null;
    try {
      const order = await BillingService.createOrder(plan.price, subscriptionId);
      razorpayOrderId = order?.id || null;
    } catch (err) {
      console.warn("[SubscriptionService] Failed to create Razorpay order:", err.message);
      razorpayOrderId = `order_sub_${uuidv4().replace(/-/g, "").substring(0, 14)}`;
    }

    // 4. Create Subscription Record (status: active)
    const subscription = formatSubscriptionModel({
      subscriptionId,
      userId,
      planId,
      status: SUBSCRIPTION_STATUSES.ACTIVE,
      startDate,
      endDate,
      hoursRemaining: plan.hoursIncluded || 0,
      kmRemaining: plan.kmIncluded || 0,
      autoRenew: typeof autoRenew === "boolean" ? autoRenew : true,
      price: plan.price,
      razorpayOrderId,
    });

    await DynamoDBHelper.putItem(SUBSCRIPTIONS_TABLE, subscription);

    // 5. Notify user if FCM token exists
    try {
      const user = await DynamoDBHelper.getItem(USERS_TABLE, { userId });
      if (user?.fcmToken) {
        await FCMClient.sendPushNotification(
          user.fcmToken,
          "Subscription Activated! 🎉",
          `Your subscription to ${plan.name} has been activated.`,
          { type: "subscription_update", subscriptionId }
        );
      }
    } catch (_) {}

    return subscription;
  }

  /**
   * GET /subscriptions/my
   * Get current user's active subscription
   */
  static async getMyActiveSubscription(userId) {
    try {
      // 1. Query GSI UserActiveIndex: PK userId, SK status = "active"
      const params = {
        TableName: SUBSCRIPTIONS_TABLE,
        IndexName: "UserActiveIndex",
        KeyConditionExpression: "userId = :uid AND #status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":uid": userId,
          ":status": SUBSCRIPTION_STATUSES.ACTIVE,
        },
      };
      const items = await DynamoDBHelper.queryItems(params);
      if (items && items.length > 0) {
        // Return latest active if multiple exist
        return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      }
    } catch (err) {
      // Fallback: Scan with filter if GSI not ready
      const fallbackParams = {
        TableName: SUBSCRIPTIONS_TABLE,
        FilterExpression: "userId = :uid AND #status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":uid": userId,
          ":status": SUBSCRIPTION_STATUSES.ACTIVE,
        },
      };
      const items = await DynamoDBHelper.scanItems(fallbackParams);
      if (items && items.length > 0) {
        return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      }
    }

    return null;
  }

  /**
   * PUT /subscriptions/:subId/cancel
   * Cancel an active subscription
   */
  static async cancelSubscription(subscriptionId, userId) {
    const subscription = await DynamoDBHelper.getItem(SUBSCRIPTIONS_TABLE, { subscriptionId });
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.userId !== userId) {
      throw new Error("Unauthorized to cancel this subscription");
    }

    if (subscription.status === SUBSCRIPTION_STATUSES.CANCELLED) {
      throw new Error("Subscription is already cancelled");
    }

    const now = new Date().toISOString();
    const updated = await DynamoDBHelper.updateItem(
      SUBSCRIPTIONS_TABLE,
      { subscriptionId },
      "SET #status = :status, autoRenew = :autoRenew, updatedAt = :now",
      { "#status": "status" },
      {
        ":status": SUBSCRIPTION_STATUSES.CANCELLED,
        ":autoRenew": false,
        ":now": now,
      }
    );

    return updated;
  }

  /**
   * PUT /subscriptions/:subId/toggle-autorenew
   * Toggle auto-renewal preference
   */
  static async toggleAutoRenew(subscriptionId, userId) {
    const subscription = await DynamoDBHelper.getItem(SUBSCRIPTIONS_TABLE, { subscriptionId });
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.userId !== userId) {
      throw new Error("Unauthorized to modify this subscription");
    }

    const nextAutoRenew = !subscription.autoRenew;
    const now = new Date().toISOString();

    const updated = await DynamoDBHelper.updateItem(
      SUBSCRIPTIONS_TABLE,
      { subscriptionId },
      "SET autoRenew = :autoRenew, updatedAt = :now",
      undefined,
      {
        ":autoRenew": nextAutoRenew,
        ":now": now,
      }
    );

    return {
      subscriptionId: updated.subscriptionId,
      autoRenew: updated.autoRenew,
    };
  }
}

module.exports = SubscriptionService;
