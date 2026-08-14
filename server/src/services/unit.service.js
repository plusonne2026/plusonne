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
    
    const updated = await DynamoDBHelper.updateItem(
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

    // Notify User via FCM
    try {
      const FCMClient = require("../clients/fcm.client");
      const USERS_TABLE = config.tables.users;
      const user = await DynamoDBHelper.getItem(USERS_TABLE, { userId });
      
      if (user && user.fcmToken) {
        if (Number(hoursAmount) < 0 && updated && updated.hoursBalance <= 2) {
          await FCMClient.sendPushNotification(
            user.fcmToken,
            "Low Wallet Balance",
            `You have ${updated.hoursBalance} hours left. Please top up soon!`,
            { type: "wallet" }
          );
        } else if (Number(hoursAmount) > 0 && updated) {
          await FCMClient.sendPushNotification(
            user.fcmToken,
            "Wallet Recharged",
            `Successfully added ${hoursAmount} hours. New balance: ${updated.hoursBalance} hours.`,
            { type: "wallet" }
          );
        }
      }
    } catch (err) {
      console.error("Failed to send wallet FCM:", err);
    }

    return updated;
  }
}

module.exports = UnitService;
