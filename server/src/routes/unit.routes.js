const express = require("express");
const router = express.Router();
const UnitController = require("../controllers/unit.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { ROLES } = require("../config/constants");

/**
 * Public Routes
 */
// GET /api/v1/units/prices — Get current global unit prices
router.get("/prices", UnitController.getUnitPrices);

/**
 * Protected Routes (User Role)
 */
router.use(authMiddleware.authenticate);

// 1. POST /api/v1/units/purchase — Purchase time or distance units
router.post("/purchase", requireRole(ROLES.USER), UnitController.purchaseUnits);

// 2. GET /api/v1/units/balance — Get current balances
router.get("/balance", requireRole(ROLES.USER), UnitController.getMyBalance);

// 3. GET /api/v1/units/history — Get purchase/usage history
router.get("/history", requireRole(ROLES.USER), UnitController.getUnitHistory);

module.exports = router;
