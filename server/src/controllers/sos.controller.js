const DynamoDBHelper = require('../clients/dynamodb.client');
const config = require('../config/env');
const crypto = require('crypto');

class SOSController {
  /**
   * POST /api/v1/sos/trigger
   */
  static async triggerSOS(req, res, next) {
    try {
      const { bookingId, location, emergencyNumber = "112" } = req.body;
      const { userId, role } = req.user;

      const alertId = crypto.randomUUID();
      const now = new Date().toISOString();

      const sosAlert = {
        alertId,
        bookingId,
        triggeredBy: userId,
        triggerRole: role, // 'user' or 'host'
        location,
        emergencyNumber,
        status: "active",
        createdAt: now,
        updatedAt: now
      };

      // Ensure the table exists in config.tables.sosAlerts if added, else use hardcoded name for MVP
      const tableName = config.tables.sosAlerts || "PlusOne_SOSAlerts";
      await DynamoDBHelper.putItem(tableName, sosAlert);

      // Notify all admins via FCM
      try {
        const FCMClient = require('../clients/fcm.client');
        const adminUsers = await DynamoDBHelper.scanItems({
          TableName: config.tables.users,
          FilterExpression: "#role = :adminRole",
          ExpressionAttributeNames: { "#role": "role" },
          ExpressionAttributeValues: { ":adminRole": "admin" }
        });
        
        for (const admin of adminUsers) {
          if (admin.fcmToken) {
            await FCMClient.sendPushNotification(
              admin.fcmToken,
              "🚨 SOS ALERT TRIGGERED",
              `An active session has triggered an SOS alert!`,
              { type: "sos", alertId }
            );
          }
        }
        
        // Auto-Escalation timer (2 minutes)
        setTimeout(async () => {
          const currentAlert = await DynamoDBHelper.getItem(tableName, { alertId });
          if (currentAlert && currentAlert.status === "active" && !currentAlert.assignedAgentId) {
            console.log(`[Auto-Escalation] Alert ${alertId} escalated to Emergency Services.`);
            for (const admin of adminUsers) {
              if (admin.fcmToken) {
                await FCMClient.sendPushNotification(
                  admin.fcmToken,
                  "🚨 SOS ESCALATION",
                  `Alert ${alertId} was not acknowledged. Emergency services workflow triggered!`,
                  { type: "sos", alertId }
                );
              }
            }
          }
        }, 120000); // 2 minutes
      } catch (err) {
        console.error("Error triggering SOS push notifications:", err);
      }

      return res.status(200).json({
        success: true,
        message: "SOS Alert Sent",
        data: sosAlert
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/sos/:alertId/status
   */
  static async updateSOSStatus(req, res, next) {
    try {
      const { alertId } = req.params;
      const { status, notes, assignedAgentId, emergencyServicesCalled } = req.body;
      const now = new Date().toISOString();
      const tableName = config.tables.sosAlerts || "PlusOne_SOSAlerts";

      let updateExpression = "SET #status = :status, updatedAt = :now";
      const expressionAttributeNames = { "#status": "status" };
      const expressionAttributeValues = { ":status": status, ":now": now };

      if (notes) {
        updateExpression += ", notes = :notes";
        expressionAttributeValues[":notes"] = notes;
      }
      
      if (assignedAgentId) {
        updateExpression += ", assignedAgentId = :assignedAgentId";
        expressionAttributeValues[":assignedAgentId"] = assignedAgentId;
      }

      if (emergencyServicesCalled !== undefined) {
        updateExpression += ", emergencyServicesCalled = :emergencyServicesCalled";
        expressionAttributeValues[":emergencyServicesCalled"] = emergencyServicesCalled;
      }

      const updated = await DynamoDBHelper.updateItem(
        tableName,
        { alertId },
        updateExpression,
        expressionAttributeNames,
        expressionAttributeValues
      );

      return res.status(200).json({
        success: true,
        message: "SOS Alert Updated",
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/sos/active
   */
  static async getActiveAlerts(req, res, next) {
    try {
      const tableName = config.tables.sosAlerts || "PlusOne_SOSAlerts";
      
      const params = {
        TableName: tableName,
        FilterExpression: "#status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": "active" },
      };
      const alerts = await DynamoDBHelper.scanItems(params);

      return res.status(200).json({
        success: true,
        data: alerts
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SOSController;
