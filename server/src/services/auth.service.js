const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");
const { formatUserModel } = require("../models/user.model");

const TABLE_NAME = config.tables.users;

class AuthService {
  /**
   * Find existing user by firebaseUid
   */
  static async getUserByFirebaseUid(firebaseUid) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: "FirebaseUidIndex", // Optional index or fallback scan for dev
      FilterExpression: "firebaseUid = :uid",
      ExpressionAttributeValues: {
        ":uid": firebaseUid,
      },
    };

    try {
      const items = await DynamoDBHelper.scanItems(params);
      return items.length > 0 ? items[0] : null;
    } catch (error) {
      console.error("Error finding user by firebaseUid:", error);
      throw error;
    }
  }

  /**
   * Get user by primary key (userId)
   */
  static async getUserById(userId) {
    return await DynamoDBHelper.getItem(TABLE_NAME, { userId });
  }

  /**
   * Register or login existing user
   */
  static async registerUser(payload) {
    // 1. Check if user already exists
    const existingUser = await this.getUserByFirebaseUid(payload.firebaseUid);
    if (existingUser) {
      // Update lastLoginAt
      const now = new Date().toISOString();
      await DynamoDBHelper.updateItem(
        TABLE_NAME,
        { userId: existingUser.userId },
        "SET lastLoginAt = :now, updatedAt = :now",
        undefined,
        { ":now": now }
      );
      existingUser.lastLoginAt = now;
      existingUser.updatedAt = now;
      return { user: existingUser, isNewUser: false };
    }

    // 2. Create new user profile
    const newUser = formatUserModel(payload);
    await DynamoDBHelper.putItem(TABLE_NAME, newUser);

    return { user: newUser, isNewUser: true };
  }

  /**
   * Verify token / login user
   */
  static async verifyLoginToken(firebaseUid) {
    const user = await this.getUserByFirebaseUid(firebaseUid);
    if (!user) {
      return null;
    }

    const now = new Date().toISOString();
    await DynamoDBHelper.updateItem(
      TABLE_NAME,
      { userId: user.userId },
      "SET lastLoginAt = :now",
      undefined,
      { ":now": now }
    );
    user.lastLoginAt = now;
    return user;
  }
}

module.exports = AuthService;
