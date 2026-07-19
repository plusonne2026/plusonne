const express = require("express");
const { ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const { dynamoDbClient } = require("../config/dynamodb.config");
const authRoutes = require("./auth.routes");
const hostRoutes = require("./host.routes");
const mediaRoutes = require("./media.routes");
const adminRoutes = require("./admin.routes");

const router = express.Router();


/**
 * @route   GET /health
 * @desc    Comprehensive Health Check checking DynamoDB connection
 * @access  Public
 */
router.get("/health", async (req, res) => {
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();

  let dbStatus = "DISCONNECTED";
  let dbError = null;
  let tables = [];

  try {
    const listCmd = new ListTablesCommand({});
    const dbRes = await dynamoDbClient.send(listCmd);
    dbStatus = "CONNECTED";
    tables = dbRes.TableNames || [];
  } catch (err) {
    dbError = err.message;
  }

  const isHealthy = dbStatus === "CONNECTED";

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "OK" : "UNHEALTHY",
    service: "PlusOnne Backend API",
    timestamp,
    uptime: `${Math.floor(uptime)} seconds`,
    database: {
      type: "DynamoDB (Docker Localhost)",
      status: dbStatus,
      tablesCount: tables.length,
      tables,
      error: dbError,
    },
  });
});

// Mount modular routes
router.use("/auth", authRoutes);
router.use("/hosts", hostRoutes);
router.use("/media", mediaRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
