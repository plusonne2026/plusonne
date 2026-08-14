const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");

const UserController = {
  /**
   * Get user profile
   */
  getMe: async (req, res) => {
    try {
      const userId = req.user.uid;
      const user = await DynamoDBHelper.getItem(config.tables.users, { userId });
      
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      console.error("PlusOnne API Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Save FCM Token for the user
   */
  updateFcmToken: async (req, res) => {
    try {
      const userId = req.user.uid;
      const { fcmToken } = req.body;
      
      if (!fcmToken) {
        return res.status(400).json({ success: false, error: "fcmToken is required" });
      }

      const updatedUser = await DynamoDBHelper.updateItem(
        config.tables.users,
        { userId },
        "SET fcmToken = :token, updatedAt = :now",
        {},
        { ":token": fcmToken, ":now": new Date().toISOString() }
      );

      res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      console.error("PlusOnne API Error saving FCM Token:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Update user profile
   */
  updateMe: async (req, res) => {
    try {
      const userId = req.user.uid;
      const { displayName, city, preferredLanguages, avatarUrl } = req.body;

      const user = await DynamoDBHelper.getItem(config.tables.users, { userId });
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      const updates = { updatedAt: new Date().toISOString() };
      if (displayName) updates.displayName = displayName;
      if (city) updates.city = city;
      if (preferredLanguages) updates.preferredLanguages = preferredLanguages;
      if (avatarUrl) updates.avatarUrl = avatarUrl;

      // Construct UpdateExpression
      const updateExpressionParts = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};

      Object.keys(updates).forEach((key) => {
        updateExpressionParts.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = updates[key];
      });

      const updateExpression = `SET ${updateExpressionParts.join(", ")}`;

      const updatedUser = await DynamoDBHelper.updateItem(
        config.tables.users,
        { userId },
        updateExpression,
        expressionAttributeNames,
        expressionAttributeValues
      );

      res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      console.error("PlusOnne API Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = UserController;
