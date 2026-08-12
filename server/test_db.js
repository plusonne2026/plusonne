const config = require('./src/config/env');
const DynamoDBHelper = require('./src/clients/dynamodb.client');

async function check() {
  try {
    console.log("Tables config:", config.tables);
    const bookings = await DynamoDBHelper.scanItems({ TableName: config.tables.bookings });
    console.log("All bookings:", bookings.length);
    bookings.forEach(b => console.log(`Booking ID: ${b.bookingId}, User ID: ${b.userId}, Status: ${b.status}, CreatedAt: ${b.createdAt}`));
  } catch (err) {
    console.error(err);
  }
}
check();
