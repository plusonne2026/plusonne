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
  },
  jwtSecret: process.env.JWT_SECRET || "plusone_default_secret",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "demo",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
};

module.exports = config;
