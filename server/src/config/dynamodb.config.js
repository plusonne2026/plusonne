const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const config = require("./env");

const clientConfig = {
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
};

// Connect to Docker local DynamoDB when endpoint is provided (http://localhost:8000)
if (config.aws.dynamodbEndpoint) {
  clientConfig.endpoint = config.aws.dynamodbEndpoint;
}

const dynamoDbClient = new DynamoDBClient(clientConfig);

const docClient = DynamoDBDocumentClient.from(dynamoDbClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

module.exports = {
  dynamoDbClient,
  docClient,
};
