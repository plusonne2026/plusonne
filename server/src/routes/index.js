const express = require("express");
const { ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const { dynamoDbClient } = require("../config/dynamodb.config");
const authRoutes = require("./auth.routes");
const hostRoutes = require("./host.routes");
const mediaRoutes = require("./media.routes");
const adminRoutes = require("./admin.routes");
const planRoutes = require("./plan.routes");
const unitRoutes = require("./unit.routes");
const categoryRoutes = require("./category.routes");
const packageRoutes = require("./package.routes");
const bookingRoutes = require("./booking.routes");
const paymentRoutes = require("./payment.routes");
const sessionRoutes = require("./session.routes");
const sosRoutes = require("./sos.routes");
const chatRoutes = require("./chat.routes");

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

const userRoutes = require("./user.routes");
const ratingRoutes = require("./rating.routes");

// Mount modular routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/hosts", hostRoutes);
router.use("/media", mediaRoutes);
router.use("/admin", adminRoutes);
router.use("/plans", planRoutes);
router.use("/units", unitRoutes);
router.use("/categories", categoryRoutes);
router.use("/packages", packageRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/sessions", sessionRoutes);
router.use("/sos", sosRoutes);
router.use("/chats", chatRoutes);
router.use("/ratings", ratingRoutes);
const geocodeRoutes = require("./geocode.routes");
router.use("/geocode", geocodeRoutes);

module.exports = router;
