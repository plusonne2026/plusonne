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
   * Purchase time or distance units matching Section 6.10 documentation
   * Supports:
   *   { type: "hours"|"km", amount: 10, pricePerUnit?: 150 }
   *   Legacy fallback: { hoursAmount, kmAmount }
   */
  static async purchaseUnits(req, res, next) {
    try {
      const userId = req.user.userId;
      const { type, amount, pricePerUnit, autoCredit, hoursAmount, kmAmount } = req.body;

      // Handle documented format: { type, amount }
      if (type && amount !== undefined) {
        const result = await UnitService.purchaseUnits(userId, {
          type,
          amount,
          pricePerUnit,
          autoCredit: autoCredit !== undefined ? Boolean(autoCredit) : true,
        });

        return res.status(200).json({
          success: true,
          message: "Unit purchase initiated successfully",
          data: {
            razorpayOrderId: result.razorpayOrderId,
            purchase: result.purchase,
          },
        });
      }

      // Legacy fallback: { hoursAmount, kmAmount }
      if (hoursAmount || kmAmount) {
        const updated = await UnitService.adjustUserBalance(userId, hoursAmount || 0, kmAmount || 0);
        return res.status(200).json({
          success: true,
          message: "Successfully purchased units",
          data: updated,
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid request payload. Must provide { type: "hours"|"km", amount: number }',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/units/balance
   * Get current authenticated user's wallet balance matching Table 8
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

  /**
   * GET /api/v1/units/history
   * Get unit-specific purchase and usage history
   */
  static async getUnitHistory(req, res, next) {
    try {
      const userId = req.user.userId;
      const history = await UnitService.getUnitHistory(userId);
      return res.status(200).json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UnitController;
