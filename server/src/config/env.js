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
  },
  jwtSecret: process.env.JWT_SECRET || "plusone_default_secret",
};

module.exports = config;
