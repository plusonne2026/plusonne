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
    console.error("❌ Failed to create DynamoDB users table:", err);
  }
}

async function createHostsTable() {
  const tableName = config.tables.hosts || "PlusOne_HostProfiles";
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
        console.log(`✅ Table "${tableName}" already exists.`);
        return;
      }
    }

    const params = {
      TableName: tableName,
      KeySchema: [
        { AttributeName: "hostId", KeyType: "HASH" }, // Partition Key
      ],
      AttributeDefinitions: [
        { AttributeName: "hostId", AttributeType: "S" },
      ],
      BillingMode: "PAY_PER_REQUEST", // On-Demand MVP specs
    };

    console.log(`Creating table "${tableName}"...`);
    await dynamoDbClient.send(new CreateTableCommand(params));
    console.log(`🎉 Successfully created table "${tableName}" in local DynamoDB!`);
  } catch (err) {
    console.error("❌ Failed to create DynamoDB hosts table:", err);
  }
}

async function createPlansTable() {
  const tableName = config.tables.pricingPlans;
  try {
    const existing = await dynamoDbClient.send(new ListTablesCommand({}));
    if (existing.TableNames?.includes(tableName)) {
      console.log(`✅ Table "${tableName}" already exists.`);
      return;
    }
    const params = {
      TableName: tableName,
      KeySchema: [{ AttributeName: "planId", KeyType: "HASH" }],
      AttributeDefinitions: [{ AttributeName: "planId", AttributeType: "S" }],
      BillingMode: "PAY_PER_REQUEST",
    };
    await dynamoDbClient.send(new CreateTableCommand(params));
    console.log(`🎉 Successfully created table "${tableName}"!`);
  } catch (err) {
    console.error(`❌ Failed to create table ${tableName}:`, err);
  }
}

async function createUnitBalancesTable() {
  const tableName = config.tables.unitBalances;
  try {
    const existing = await dynamoDbClient.send(new ListTablesCommand({}));
    if (existing.TableNames?.includes(tableName)) {
      console.log(`✅ Table "${tableName}" already exists.`);
      return;
    }
    const params = {
      TableName: tableName,
      KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
      AttributeDefinitions: [{ AttributeName: "userId", AttributeType: "S" }],
      BillingMode: "PAY_PER_REQUEST",
    };
    await dynamoDbClient.send(new CreateTableCommand(params));
    console.log(`🎉 Successfully created table "${tableName}"!`);
  } catch (err) {
    console.error(`❌ Failed to create table ${tableName}:`, err);
  }
}

async function createSettingsTable() {
  const tableName = config.tables.settings;
  try {
    const existing = await dynamoDbClient.send(new ListTablesCommand({}));
    if (existing.TableNames?.includes(tableName)) {
      console.log(`✅ Table "${tableName}" already exists.`);
      return;
    }
    const params = {
      TableName: tableName,
      KeySchema: [{ AttributeName: "settingId", KeyType: "HASH" }],
      AttributeDefinitions: [{ AttributeName: "settingId", AttributeType: "S" }],
      BillingMode: "PAY_PER_REQUEST",
    };
    await dynamoDbClient.send(new CreateTableCommand(params));
    console.log(`🎉 Successfully created table "${tableName}"!`);
  } catch (err) {
    console.error(`❌ Failed to create table ${tableName}:`, err);
  }
}

async function createCategoriesTable() {
  const tableName = config.tables.categories;
  try {
    const existing = await dynamoDbClient.send(new ListTablesCommand({}));
    if (existing.TableNames?.includes(tableName)) {
      console.log(`✅ Table "${tableName}" already exists.`);
      return;
    }
    const params = {
      TableName: tableName,
      KeySchema: [{ AttributeName: "categoryId", KeyType: "HASH" }],
      AttributeDefinitions: [{ AttributeName: "categoryId", AttributeType: "S" }],
      BillingMode: "PAY_PER_REQUEST",
    };
    await dynamoDbClient.send(new CreateTableCommand(params));
    console.log(`🎉 Successfully created table "${tableName}"!`);
  } catch (err) {
    console.error(`❌ Failed to create table ${tableName}:`, err);
  }
}

async function createPackagesTable() {
  const tableName = config.tables.packages;
  try {
    const existing = await dynamoDbClient.send(new ListTablesCommand({}));
    if (existing.TableNames?.includes(tableName)) {
      console.log(`✅ Table "${tableName}" already exists.`);
      return;
    }
    const params = {
      TableName: tableName,
      KeySchema: [{ AttributeName: "packageId", KeyType: "HASH" }],
      AttributeDefinitions: [
        { AttributeName: "packageId", AttributeType: "S" },
        { AttributeName: "categoryId", AttributeType: "S" },
        { AttributeName: "city", AttributeType: "S" }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "CategoryCityIndex",
          KeySchema: [
            { AttributeName: "categoryId", KeyType: "HASH" },
            { AttributeName: "city", KeyType: "RANGE" }
          ],
          Projection: { ProjectionType: "ALL" },
        }
      ],
      BillingMode: "PAY_PER_REQUEST",
    };
    await dynamoDbClient.send(new CreateTableCommand(params));
    console.log(`🎉 Successfully created table "${tableName}"!`);
  } catch (err) {
    console.error(`❌ Failed to create table ${tableName}:`, err);
  }
}

async function createBookingsTable() {
  const tableName = config.tables.bookings;
  try {
    const existing = await dynamoDbClient.send(new ListTablesCommand({}));
    if (existing.TableNames?.includes(tableName)) {
      console.log(`✅ Table "${tableName}" already exists.`);
      return;
    }
    const params = {
      TableName: tableName,
      KeySchema: [{ AttributeName: "bookingId", KeyType: "HASH" }],
      AttributeDefinitions: [
        { AttributeName: "bookingId", AttributeType: "S" },
        { AttributeName: "userId", AttributeType: "S" },
        { AttributeName: "hostId", AttributeType: "S" },
        { AttributeName: "status", AttributeType: "S" },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "UserBookingsIndex",
          KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
        },
        {
          IndexName: "HostBookingsIndex",
          KeySchema: [{ AttributeName: "hostId", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
        },
        {
          IndexName: "StatusIndex",
          KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
        }
      ],
      BillingMode: "PAY_PER_REQUEST",
    };
    await dynamoDbClient.send(new CreateTableCommand(params));
    console.log(`🎉 Successfully created table "${tableName}"!`);
  } catch (err) {
    console.error(`❌ Failed to create table ${tableName}:`, err);
  }
}

async function createPaymentsTable() {
  const tableName = config.tables.payments;
  try {
    const existing = await dynamoDbClient.send(new ListTablesCommand({}));
    if (existing.TableNames?.includes(tableName)) {
      console.log(`✅ Table "${tableName}" already exists.`);
      return;
    }
    const params = {
      TableName: tableName,
      KeySchema: [{ AttributeName: "paymentId", KeyType: "HASH" }],
      AttributeDefinitions: [
        { AttributeName: "paymentId", AttributeType: "S" },
        { AttributeName: "bookingId", AttributeType: "S" },
        { AttributeName: "userId", AttributeType: "S" },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "BookingIndex",
          KeySchema: [{ AttributeName: "bookingId", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
        },
        {
          IndexName: "UserIndex",
          KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
        }
      ],
      BillingMode: "PAY_PER_REQUEST",
    };
    await dynamoDbClient.send(new CreateTableCommand(params));
    console.log(`🎉 Successfully created table "${tableName}"!`);
  } catch (err) {
    console.error(`❌ Failed to create table ${tableName}:`, err);
  }
}

async function createRatingsTable() {
  const tableName = config.tables.ratings;
  try {
    const existing = await dynamoDbClient.send(new ListTablesCommand({}));
    if (existing.TableNames?.includes(tableName)) {
      console.log(`✅ Table "${tableName}" already exists.`);
      return;
    }
    const params = {
      TableName: tableName,
      KeySchema: [{ AttributeName: "ratingId", KeyType: "HASH" }],
      AttributeDefinitions: [
        { AttributeName: "ratingId", AttributeType: "S" },
        { AttributeName: "bookingId", AttributeType: "S" },
        { AttributeName: "targetUserId", AttributeType: "S" },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "BookingIndex",
          KeySchema: [{ AttributeName: "bookingId", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
        },
        {
          IndexName: "TargetUserIndex",
          KeySchema: [{ AttributeName: "targetUserId", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
        }
      ],
      BillingMode: "PAY_PER_REQUEST",
    };
    await dynamoDbClient.send(new CreateTableCommand(params));
    console.log(`🎉 Successfully created table "${tableName}"!`);
  } catch (err) {
    console.error(`❌ Failed to create table ${tableName}:`, err);
  }
}

async function createSosAlertsTable() {
  const tableName = config.tables.sosAlerts;
  try {
    const existing = await dynamoDbClient.send(new ListTablesCommand({}));
    if (existing.TableNames?.includes(tableName)) {
      console.log(`✅ Table "${tableName}" already exists.`);
      return;
    }
    const params = {
      TableName: tableName,
      KeySchema: [{ AttributeName: "alertId", KeyType: "HASH" }],
      AttributeDefinitions: [
        { AttributeName: "alertId", AttributeType: "S" },
        { AttributeName: "status", AttributeType: "S" },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "StatusIndex",
          KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
        }
      ],
      BillingMode: "PAY_PER_REQUEST",
    };
    await dynamoDbClient.send(new CreateTableCommand(params));
    console.log(`🎉 Successfully created table "${tableName}"!`);
  } catch (err) {
    console.error(`❌ Failed to create table ${tableName}:`, err);
  }
}

async function main() {
  await createUsersTable();
  await createHostsTable();
  await createPlansTable();
  await createUnitBalancesTable();
  await createSettingsTable();
  await createCategoriesTable();
  await createPackagesTable();
  await createBookingsTable();
  await createPaymentsTable();
  await createRatingsTable();
  await createSosAlertsTable();
}

main();
