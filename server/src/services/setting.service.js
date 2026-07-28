const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");

const SETTINGS_TABLE = config.tables.settings;
const UNIT_PRICES_KEY = "global_unit_prices"; // Hardcoded PK for unit prices

class SettingService {
  /**
   * Get global unit prices (per hour, per km)
   */
  static async getUnitPrices() {
    const setting = await DynamoDBHelper.getItem(SETTINGS_TABLE, { settingId: UNIT_PRICES_KEY });
    if (!setting) {
      // Return defaults if not set yet
      return {
        settingId: UNIT_PRICES_KEY,
        hourPrice: 200,
        kmPrice: 15,
      };
    }
    return setting;
  }

  /**
   * Update global unit prices
   */
  static async updateUnitPrices(hourPrice, kmPrice) {
    const now = new Date().toISOString();
    
    const settingData = {
      settingId: UNIT_PRICES_KEY,
      hourPrice: Number(hourPrice),
      kmPrice: Number(kmPrice),
      updatedAt: now,
    };

    await DynamoDBHelper.putItem(SETTINGS_TABLE, settingData);
    return settingData;
  }
}

module.exports = SettingService;
