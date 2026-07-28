const PlanService = require("../services/plan.service");

class PlanController {
  /**
   * GET /api/v1/plans
   * Fetches only active plans for users
   */
  static async getActivePlans(req, res, next) {
    try {
      // includeInactive = false
      const plans = await PlanService.getAllPlans(false);
      return res.status(200).json({
        success: true,
        count: plans.length,
        data: plans,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PlanController;
