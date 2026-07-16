# DynamoDB Setup & AWS Migration Guide (PlusOne Project)

This document contains a complete guide for running DynamoDB Local (Docker) and migrating the configuration to AWS DynamoDB (Cloud) for the **PlusOne** project. You can import this markdown directly into **NotebookLM** as a source document.

---

## 1. Local DynamoDB Setup (Docker Compose)

We use a Docker Compose configuration to spin up a local instance of DynamoDB along with a web-based administration console (`dynamodb-admin`).

### Docker Compose File (`docker-compose.yml`)
Place this file in the root folder of the project (`docker-compose.yml`):

```yaml
services:
  # DynamoDB Local Database
  dynamodb-local:
    image: amazon/dynamodb-local:latest
    container_name: local-dynamodb
    ports:
      - "8000:8000"
    command: "-jar DynamoDBLocal.jar -sharedDb -dbPath ./data"
    volumes:
      - ./dynamodb_data:/home/dynamodblocal/data
    working_dir: /home/dynamodblocal

  # Visual GUI for DynamoDB (View tables & data in your browser)
  dynamodb-admin:
    image: aaronshaf/dynamodb-admin:latest
    container_name: local-dynamodb-admin
    ports:
      - "8001:8001"
    environment:
      - DYNAMO_ENDPOINT=http://dynamodb-local:8000
    depends_on:
      - dynamodb-local
```

### Docker Commands
* **Start local DynamoDB & Admin UI (Background):**
  ```bash
  docker compose up -d
  ```
  *(Note: If you encounter a permission denied error connecting to `/var/run/docker.sock`, run with `sudo docker compose up -d` or add your user to the docker group via `sudo usermod -aG docker $USER && newgrp docker`)*
* **Check running containers:**
  ```bash
  docker ps
  ```
* **Access Web Dashboard (GUI):**
  Open [http://localhost:8001](http://localhost:8001) in your browser.
* **Stop local DynamoDB:**
  ```bash
  docker compose down
  ```

*Note: The local database files are saved inside the `./dynamodb_data` folder in your project root, which has been added to `.gitignore` so that it doesn't get pushed to Git.*

---

## 2. Local DynamoDB CLI Command Reference

To interact with local DynamoDB via the AWS CLI, you **must** supply the `--endpoint-url` flag pointing to `http://localhost:8000`.

### A. List Tables
```bash
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

### B. Create Table (`PlusOne_Users`)
```bash
aws dynamodb create-table \
    --table-name PlusOne_Users \
    --attribute-definitions AttributeName=userId,AttributeType=S \
    --key-schema AttributeName=userId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url http://localhost:8000
```

### C. Put Item (Insert Data)
```bash
aws dynamodb put-item \
    --table-name PlusOne_Users \
    --item '{"userId": {"S": "user123"}, "name": {"S": "Shubham"}, "email": {"S": "shubham@example.com"}}' \
    --endpoint-url http://localhost:8000
```

### D. Get Item (Fetch Data by Key)
```bash
aws dynamodb get-item \
    --table-name PlusOne_Users \
    --key '{"userId": {"S": "user123"}}' \
    --endpoint-url http://localhost:8000
```

### E. Scan Table (Fetch All Data)
```bash
aws dynamodb scan --table-name PlusOne_Users --endpoint-url http://localhost:8000
```

### F. Delete Table
```bash
aws dynamodb delete-table --table-name PlusOne_Users --endpoint-url http://localhost:8000
```

---

## 3. Migration Guide: Switching to AWS DynamoDB (Cloud)

To switch the backend application from Docker/Local DynamoDB to actual AWS Cloud DynamoDB, follow these modifications:

### A. Update environment configuration (`.env`)
Comment out or remove the local `DYNAMODB_ENDPOINT` variable and substitute the AWS Keys:

```env
# AWS Configuration
AWS_REGION=ap-south-1                # Your AWS Region (e.g. ap-south-1)
AWS_ACCESS_KEY_ID=YOUR_AWS_KEY_ID    # Your real AWS IAM Access Key ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET # Your real AWS IAM Secret Access Key

# DYNAMODB_ENDPOINT=http://localhost:8000 <--- REMOVE OR COMMENT OUT THIS LINE
```

> **Production Deployment Tip:** If running on AWS services (EC2, ECS, Fargate, or Lambda), avoid setting `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in environment variables. Assign an **IAM Instance Profile** or **Execution Role** directly to the resource. The AWS SDK will resolve credentials automatically.

### B. Update Configuration Loader Code (`src/config/env.js`)
Ensure the code does not fall back to `http://localhost:8000` when `DYNAMODB_ENDPOINT` is omitted. Modify `src/config/env.js`:

```javascript
  aws: {
    region: process.env.AWS_REGION || "ap-south-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "local",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "local",
    dynamodbEndpoint: process.env.DYNAMODB_ENDPOINT || null, // Fall back to null instead of localhost:8000
  },
```

### C. Client Configuration (`src/config/dynamodb.config.js`)
The client wrapper dynamically assigns the endpoint only if `config.aws.dynamodbEndpoint` exists (is not `null` / `undefined`):

```javascript
const clientConfig = {
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
};

if (config.aws.dynamodbEndpoint) {
  clientConfig.endpoint = config.aws.dynamodbEndpoint;
}
```
*When `dynamodbEndpoint` is null, the AWS SDK defaults to connecting to AWS Cloud endpoints automatically.*

### D. Clean up Startup & CLI logs
Update logs to visually reflect if we are connected to AWS Cloud or Localhost:
* In `src/index.js`:
  ```javascript
  console.log(`🗄️  DynamoDB Endpoint: ${config.aws.dynamodbEndpoint || "AWS Cloud (Default)"}`);
  ```
* In `src/scripts/createTables.js`:
  ```javascript
  console.log(`Checking if table "${tableName}" exists in DynamoDB (${config.aws.dynamodbEndpoint || "AWS Cloud"})...`);
  ```
