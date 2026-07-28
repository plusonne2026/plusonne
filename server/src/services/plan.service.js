const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");

const PLANS_TABLE = config.tables.pricingPlans;

class PlanService {
  /**
   * Create a new pricing plan
   */
  static async createPlan(planData) {
    const now = new Date().toISOString();
    
    const newPlan = {
      planId: planData.planId, // E.g., 'monthly_pro'
      name: planData.name,
      type: planData.type,
      price: Number(planData.price),
      hoursIncluded: Number(planData.hoursIncluded),
      kmIncluded: Number(planData.kmIncluded),
      overageDiscount: Number(planData.overageDiscount || 0),
      priorityBooking: Boolean(planData.priorityBooking),
      features: planData.features || [],
      isActive: planData.isActive !== undefined ? Boolean(planData.isActive) : true,
      displayOrder: Number(planData.displayOrder || 1),
      createdAt: now,
      updatedAt: now,
    };

    await DynamoDBHelper.putItem(PLANS_TABLE, newPlan);
    return newPlan;
  }

  /**
   * Get all pricing plans
   */
  static async getAllPlans(includeInactive = true) {
    const plans = await DynamoDBHelper.scanItems({ TableName: PLANS_TABLE });
    
    let filteredPlans = plans;
    if (!includeInactive) {
      filteredPlans = plans.filter((p) => p.isActive === true);
    }

    // Sort by displayOrder ascending
    return filteredPlans.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  /**
   * Update plan active status
   */
  static async updatePlanStatus(planId, isActive) {
    const now = new Date().toISOString();
    return await DynamoDBHelper.updateItem(
      PLANS_TABLE,
      { planId },
      "SET isActive = :isActive, updatedAt = :now",
      {},
      { ":isActive": Boolean(isActive), ":now": now }
    );
  }
}

module.exports = PlanService;
