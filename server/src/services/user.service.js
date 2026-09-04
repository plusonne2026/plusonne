const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");

const TABLE_NAME = config.tables.users;

class UserService {
  /**
   * Get user by primary key (userId)
   */
  static async getUserById(userId) {
    return await DynamoDBHelper.getItem(TABLE_NAME, { userId });
  }

  /**
   * Update user profile fields (PUT /users/me)
   * Allowed: displayName, avatarUrl, city, coordinates, preferredLanguages
   */
  static async updateProfile(userId, data) {
    const ALLOWED_FIELDS = ["displayName", "avatarUrl", "city", "coordinates", "preferredLanguages"];
    const updates = { updatedAt: new Date().toISOString() };

    ALLOWED_FIELDS.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        updates[key] = data[key];
      }
    });

    const updateExpressionParts = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updates).forEach((key) => {
      updateExpressionParts.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = updates[key];
    });

    const updateExpression = `SET ${updateExpressionParts.join(", ")}`;

    return await DynamoDBHelper.updateItem(
      TABLE_NAME,
      { userId },
      updateExpression,
      expressionAttributeNames,
      expressionAttributeValues
    );
  }

  /**
   * Update user status — admin only (PUT /users/:userId/status)
   * Allowed status: "active" | "suspended" | "deleted"
   */
  static async updateStatus(userId, status) {
    const ALLOWED_STATUS = ["active", "suspended", "deleted"];
    if (!ALLOWED_STATUS.includes(status)) {
      throw new Error(`Invalid status. Allowed: ${ALLOWED_STATUS.join(", ")}`);
    }

    const now = new Date().toISOString();
    return await DynamoDBHelper.updateItem(
      TABLE_NAME,
      { userId },
      "SET #status = :status, updatedAt = :now",
      { "#status": "status" },
      { ":status": status, ":now": now }
    );
  }

  /**
   * List all users with pagination — admin only (GET /users)
   */
  static async listUsers({ limit = 20, lastKey = null, role = null, status = null }) {
    const scanParams = {
      TableName: TABLE_NAME,
      Limit: parseInt(limit),
    };

    // Filters
    const filterParts = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    if (role) {
      filterParts.push("#role = :role");
      expressionAttributeNames["#role"] = "role";
      expressionAttributeValues[":role"] = role;
    }

    if (status) {
      filterParts.push("#status = :status");
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = status;
    }

    if (filterParts.length > 0) {
      scanParams.FilterExpression = filterParts.join(" AND ");
      scanParams.ExpressionAttributeNames = expressionAttributeNames;
      scanParams.ExpressionAttributeValues = expressionAttributeValues;
    }

    // Pagination
    if (lastKey) {
      try {
        scanParams.ExclusiveStartKey = JSON.parse(Buffer.from(lastKey, "base64").toString("utf8"));
      } catch {
        // Invalid lastKey — ignore, start from beginning
      }
    }

    const result = await DynamoDBHelper.scanItems(scanParams, true); // true = return raw result with LastEvaluatedKey

    return {
      users: result.Items || result,
      nextKey: result.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
        : null,
      count: (result.Items || result).length,
    };
  }
}

module.exports = UserService;
