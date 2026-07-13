const app = require("./app");
const config = require("./config/env");

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 PlusOnne Backend API running on port ${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🗄️  DynamoDB Endpoint: ${config.aws.dynamodbEndpoint}`);
  console.log(`❤️  Health Check URL: http://localhost:${PORT}/api/v1/health`);
  console.log(`=================================================`);
});

module.exports = server;
