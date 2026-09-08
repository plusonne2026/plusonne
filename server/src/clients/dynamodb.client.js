const {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");
const { docClient } = require("../config/dynamodb.config");

/**
 * Recursively removes null and undefined fields from an object
 * before writing to DynamoDB (which rejects null attribute values).
 */
function stripNulls(obj) {
  if (Array.isArray(obj)) {
    return obj.map(stripNulls);
  }
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => [k, stripNulls(v)])
    );
  }
  return obj;
}

/**
 * Reusable DynamoDB Client operations wrapper
 */
class DynamoDBHelper {
  static async putItem(TableName, Item) {
    const command = new PutCommand({
      TableName,
      Item: stripNulls(Item),   // DynamoDB rejects null values — strip them
    });
    await docClient.send(command);
    return Item;
  }

  static async getItem(TableName, Key) {
    const command = new GetCommand({
      TableName,
      Key,
    });
    const result = await docClient.send(command);
    return result.Item || null;
  }

  static async updateItem(TableName, Key, UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues) {
    const params = {
      TableName,
      Key,
      UpdateExpression,
      ReturnValues: "ALL_NEW",
    };
    if (ExpressionAttributeNames && Object.keys(ExpressionAttributeNames).length > 0) {
      params.ExpressionAttributeNames = ExpressionAttributeNames;
    }
    if (ExpressionAttributeValues && Object.keys(ExpressionAttributeValues).length > 0) {
      params.ExpressionAttributeValues = ExpressionAttributeValues;
    }
    const command = new UpdateCommand(params);
    const result = await docClient.send(command);
    return result.Attributes;
  }

  static async deleteItem(TableName, Key) {
    const command = new DeleteCommand({
      TableName,
      Key,
    });
    await docClient.send(command);
    return true;
  }

  static async queryItems(params) {
    const command = new QueryCommand(params);
    const result = await docClient.send(command);
    return result.Items || [];
  }

  static async scanItems(params) {
    const command = new ScanCommand(params);
    const result = await docClient.send(command);
    return result.Items || [];
  }
}

module.exports = DynamoDBHelper;
