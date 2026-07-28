const UnitService = require("../services/unit.service");
const SettingService = require("../services/setting.service");

class AdminUnitController {
  /**
   * GET /api/v1/admin/settings/units
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
   * PUT /api/v1/admin/settings/units
   */
  static async updateUnitPrices(req, res, next) {
    try {
      const { hourPrice, kmPrice } = req.body;
      
      if (hourPrice === undefined || kmPrice === undefined) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: hourPrice, kmPrice",
        });
      }

      const updated = await SettingService.updateUnitPrices(hourPrice, kmPrice);
      return res.status(200).json({
        success: true,
        message: "Unit prices updated successfully",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/users/:userId/balance
   */
  static async getUserBalance(req, res, next) {
    try {
      const { userId } = req.params;
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
   * POST /api/v1/admin/users/:userId/credit-units
   */
  static async creditUserUnits(req, res, next) {
    try {
      const { userId } = req.params;
      const { hoursAmount, kmAmount } = req.body;
      
      if (hoursAmount === undefined && kmAmount === undefined) {
        return res.status(400).json({
          success: false,
          message: "Must provide hoursAmount or kmAmount to credit",
        });
      }

      const updated = await UnitService.adjustUserBalance(userId, hoursAmount || 0, kmAmount || 0);
      return res.status(200).json({
        success: true,
        message: `Successfully credited units to user ${userId}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminUnitController;
