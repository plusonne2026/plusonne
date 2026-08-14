const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  aws: {
    region: process.env.AWS_REGION || "ap-south-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "local",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "local",
    dynamodbEndpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
  },
  tables: {
    users: process.env.DYNAMODB_TABLE_USERS || "PlusOne_Users",
    hosts: process.env.DYNAMODB_TABLE_HOSTS || "PlusOne_HostProfiles",
    pricingPlans: process.env.DYNAMODB_TABLE_PLANS || "PlusOne_PricingPlans",
    unitBalances: process.env.DYNAMODB_TABLE_UNIT_BALANCES || "PlusOne_UnitBalances",
    settings: process.env.DYNAMODB_TABLE_SETTINGS || "PlusOne_Settings",
    categories: process.env.DYNAMODB_TABLE_CATEGORIES || "PlusOne_Categories",
    packages: process.env.DYNAMODB_TABLE_PACKAGES || "PlusOne_Packages",
    bookings: process.env.DYNAMODB_TABLE_BOOKINGS || "PlusOne_Bookings",
    payments: process.env.DYNAMODB_TABLE_PAYMENTS || "PlusOne_Payments",
    ratings: process.env.DYNAMODB_TABLE_RATINGS || "PlusOne_Ratings",
    sosAlerts: process.env.DYNAMODB_TABLE_SOS_ALERTS || "PlusOne_SOSAlerts",
  },
  jwtSecret: process.env.JWT_SECRET || "plusone_default_secret",
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_dummykey12345",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "dummysecret_12345",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "dummy_webhook_secret",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "demo",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
};

module.exports = config;
