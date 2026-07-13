# PlusOnne Backend API (`Server`)

Express.js + Node.js + DynamoDB backend structured according to `backend_documentation.md`.

## Folder Structure
```
Server/
├── package.json
├── .env                  # Connects to local Docker DynamoDB (http://localhost:8000)
├── .env.example
└── src/
    ├── index.js          # Entry point
    ├── app.js            # Express app setup
    ├── config/
    │   ├── dynamodb.config.js # DynamoDB local / cloud client
    │   ├── env.js        # Environment loader
    │   └── constants.js  # Roles & Auth Providers
    ├── clients/
    │   └── dynamodb.client.js # Reusable DynamoDB CRUD wrappers
    ├── middleware/
    │   ├── error.middleware.js # Global error handler
    │   └── role.middleware.js  # Role checking RBAC
    ├── models/
    │   └── user.model.js # PlusOne_Users schema model
    ├── validators/
    │   └── auth.validator.js # Joi schemas
    ├── services/
    │   └── auth.service.js   # Auth business logic
    ├── controllers/
    │   └── auth.controller.js # Auth endpoints
    ├── routes/
    │   ├── index.js      # /health route + DynamoDB live status check
    │   └── auth.routes.js # /api/v1/auth/*
    └── scripts/
        └── createTables.js # Script to initialize DynamoDB tables
```

## Quick Start (Local Development)

1. **Start DynamoDB Local Docker Container:**
   ```bash
   sudo docker run -d --name dynamodb-local -p 8000:8000 amazon/dynamodb-local
   ```

2. **Install Dependencies:**
   ```bash
   cd Server
   npm install
   ```

3. **Create DynamoDB Table (`PlusOne_Users`):**
   ```bash
   npm run create-tables
   ```

4. **Start Backend Server:**
   ```bash
   npm run dev
   ```

5. **Test Health Route & Database Connection:**
   Visit: `http://localhost:5000/api/v1/health`
