const { CreateTableCommand, ListTablesCommand, DeleteTableCommand } = require("@aws-sdk/client-dynamodb");
const { dynamoDbClient } = require("../config/dynamodb.config");
const config = require("../config/env");

async function createUsersTable() {
  const tableName = config.tables.users;
  const forceRecreate = process.argv.includes("--recreate") || process.argv.includes("--force");

  console.log(`Checking if table "${tableName}" exists in DynamoDB (${config.aws.dynamodbEndpoint})...`);

  try {
    const existing = await dynamoDbClient.send(new ListTablesCommand({}));
    if (existing.TableNames?.includes(tableName)) {
      if (forceRecreate) {
        console.log(`🗑️ Deleting existing table "${tableName}" for recreation...`);
        await dynamoDbClient.send(new DeleteTableCommand({ TableName: tableName }));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.log(`✅ Table "${tableName}" already exists. (Use --recreate flag to force recreate with GlobalSecondaryIndexes)`);
        return;
      }
    }

    const params = {
      TableName: tableName,
      KeySchema: [
        { AttributeName: "userId", KeyType: "HASH" }, // Partition Key
      ],
      AttributeDefinitions: [
        { AttributeName: "userId", AttributeType: "S" },
        { AttributeName: "firebaseUid", AttributeType: "S" },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "FirebaseUidIndex",
          KeySchema: [
            { AttributeName: "firebaseUid", KeyType: "HASH" },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
        },
      ],
      BillingMode: "PAY_PER_REQUEST", // On-Demand MVP specs
    };

    console.log(`Creating table "${tableName}" with FirebaseUidIndex GSI...`);
    await dynamoDbClient.send(new CreateTableCommand(params));
    console.log(`🎉 Successfully created table "${tableName}" in local DynamoDB!`);
  } catch (err) {
    console.error("❌ Failed to create DynamoDB table:", err);
  }
}

createUsersTable();
