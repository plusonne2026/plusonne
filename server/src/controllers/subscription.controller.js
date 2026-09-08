const SubscriptionService = require("../services/subscription.service");
const { formatSubscriptionResponse } = require("../models/subscription.model");

class SubscriptionController {
  /**
   * GET /api/v1/subscriptions/plans
   * List available subscription plans
   * Auth: Public
   */
  static async getPlans(req, res, next) {
    try {
      const plans = await SubscriptionService.getAvailablePlans();
      return res.status(200).json({
        success: true,
        count: plans.length,
        data: plans,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/subscriptions/subscribe
   * Subscribe to a plan
   * Auth: user
   */
  static async subscribe(req, res, next) {
    try {
      const { userId } = req.user;
      const { planId, autoRenew } = req.body;

      if (!planId) {
        return res.status(400).json({
          success: false,
          message: "planId is required",
        });
      }

      const subscription = await SubscriptionService.subscribeToPlan(userId, {
        planId,
        autoRenew,
      });

      return res.status(201).json({
        success: true,
        message: "Subscription initiated successfully",
        data: formatSubscriptionResponse(subscription),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/subscriptions/my
   * Get my active subscription
   * Auth: user
   */
  static async getMySubscription(req, res, next) {
    try {
      const { userId } = req.user;
      const subscription = await SubscriptionService.getMyActiveSubscription(userId);

      if (!subscription) {
        return res.status(200).json({
          success: true,
          data: null,
          message: "No active subscription found",
        });
      }

      return res.status(200).json({
        success: true,
        data: formatSubscriptionResponse(subscription),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/subscriptions/:subId/cancel
   * Cancel subscription
   * Auth: user
   */
  static async cancelSubscription(req, res, next) {
    try {
      const { userId } = req.user;
      const { subId } = req.params;

      const updated = await SubscriptionService.cancelSubscription(subId, userId);

      return res.status(200).json({
        success: true,
        message: "Subscription cancelled successfully",
        data: formatSubscriptionResponse(updated),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/subscriptions/:subId/toggle-autorenew
   * Toggle auto-renewal preference
   * Auth: user
   */
  static async toggleAutoRenew(req, res, next) {
    try {
      const { userId } = req.user;
      const { subId } = req.params;

      const result = await SubscriptionService.toggleAutoRenew(subId, userId);

      return res.status(200).json({
        success: true,
        message: `Auto-renewal ${result.autoRenew ? "enabled" : "disabled"} successfully`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SubscriptionController;
