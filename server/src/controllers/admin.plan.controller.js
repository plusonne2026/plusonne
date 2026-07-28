const PlanService = require("../services/plan.service");

class AdminPlanController {
  /**
   * POST /api/v1/admin/plans
   */
  static async createPlan(req, res, next) {
    try {
      const planData = req.body;
      if (!planData.planId || !planData.name || !planData.price) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: planId, name, price",
        });
      }

      const plan = await PlanService.createPlan(planData);
      return res.status(201).json({
        success: true,
        message: "Plan created successfully",
        data: plan,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/plans
   */
  static async getPlans(req, res, next) {
    try {
      const includeInactive = req.query.includeInactive !== "false";
      const plans = await PlanService.getAllPlans(includeInactive);
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
   * PUT /api/v1/admin/plans/:planId/status
   */
  static async updatePlanStatus(req, res, next) {
    try {
      const { planId } = req.params;
      const { isActive } = req.body;

      if (isActive === undefined) {
        return res.status(400).json({
          success: false,
          message: "Missing required field: isActive",
        });
      }

      const updated = await PlanService.updatePlanStatus(planId, isActive);
      return res.status(200).json({
        success: true,
        message: `Plan status updated to ${isActive ? "active" : "inactive"}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminPlanController;
