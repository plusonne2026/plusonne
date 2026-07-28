const UnitService = require("../services/unit.service");
const SettingService = require("../services/setting.service");

class UnitController {
  /**
   * GET /api/v1/units/prices
   * Fetches global unit prices for users
   */
  static async getUnitPrices(req, res, next) {
    try {
      const prices = await SettingService.getUnitPrices();
      return res.status(200).json({
        success: true,
        data: prices,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/units/purchase
   * Simulates purchasing units for the authenticated user
   */
  static async purchaseUnits(req, res, next) {
    try {
      const userId = req.user.userId;
      const { hoursAmount, kmAmount, amountPaid } = req.body;
      
      if (!hoursAmount && !kmAmount) {
        return res.status(400).json({
          success: false,
          message: "Must provide hoursAmount or kmAmount to purchase",
        });
      }

      // In a real scenario, we'd verify the payment status via Razorpay/Stripe here.
      // For now, we simulate a successful payment and credit directly.

      const updated = await UnitService.adjustUserBalance(userId, hoursAmount || 0, kmAmount || 0);
      
      return res.status(200).json({
        success: true,
        message: `Successfully purchased units`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/units/balance
   * Get the current authenticated user's wallet balance
   */
  static async getMyBalance(req, res, next) {
    try {
      const userId = req.user.userId;
      const balance = await UnitService.getUserBalance(userId);
      return res.status(200).json({
        success: true,
        data: balance,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UnitController;
