const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");

const UNIT_BALANCES_TABLE = config.tables.unitBalances;

class UnitService {
  /**
   * Get a user's unit balance
   */
  static async getUserBalance(userId) {
    const balance = await DynamoDBHelper.getItem(UNIT_BALANCES_TABLE, { userId });
    
    if (!balance) {
      // Return 0 balances if no record exists
      return {
        userId,
        hoursBalance: 0,
        kmBalance: 0,
        totalHoursPurchased: 0,
        totalKmPurchased: 0,
        totalHoursUsed: 0,
        totalKmUsed: 0,
      };
    }
    return balance;
  }

  /**
   * Manually credit or deduct units from a user's wallet (Admin Action)
   */
  static async adjustUserBalance(userId, hoursAmount, kmAmount) {
    // We must ensure the record exists first to update it.
    // In DynamoDB, ADD command on an undefined attribute initializes it to 0 and adds.
    const now = new Date().toISOString();

    const UpdateExpression = "ADD hoursBalance :h, kmBalance :k, totalHoursPurchased :h, totalKmPurchased :k SET lastUpdated = :now";
    
    return await DynamoDBHelper.updateItem(
      UNIT_BALANCES_TABLE,
      { userId },
      UpdateExpression,
      undefined,
      {
        ":h": Number(hoursAmount) || 0,
        ":k": Number(kmAmount) || 0,
        ":now": now
      }
    );
  }
}

module.exports = UnitService;
