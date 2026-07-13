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
 * Reusable DynamoDB Client operations wrapper
 */
class DynamoDBHelper {
  static async putItem(TableName, Item) {
    const command = new PutCommand({
      TableName,
      Item,
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
    const command = new UpdateCommand({
      TableName,
      Key,
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });
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
