const { CreateTableCommand, ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const { dynamoDbClient } = require("../config/dynamodb.config");
const config = require("../config/env");

async function createUsersTable() {
  const tableName = config.tables.users;

  console.log(`Checking if table "${tableName}" exists in DynamoDB (${config.aws.dynamodbEndpoint})...`);

  try {
    const existing = await dynamoDbClient.send(new ListTablesCommand({}));
    if (existing.TableNames?.includes(tableName)) {
      console.log(`✅ Table "${tableName}" already exists. Skipping creation.`);
      return;
    }

    const params = {
      TableName: tableName,
      KeySchema: [
        { AttributeName: "userId", KeyType: "HASH" }, // Partition Key
      ],
      AttributeDefinitions: [
        { AttributeName: "userId", AttributeType: "S" },
      ],
      BillingMode: "PAY_PER_REQUEST", // On-Demand MVP specs
    };

    console.log(`Creating table "${tableName}"...`);
    await dynamoDbClient.send(new CreateTableCommand(params));
    console.log(`🎉 Successfully created table "${tableName}" in local DynamoDB!`);
  } catch (err) {
    console.error("❌ Failed to create DynamoDB table:", err);
  }
}

createUsersTable();
