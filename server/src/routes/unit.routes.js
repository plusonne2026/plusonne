const express = require("express");
const UnitController = require("../controllers/unit.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @route   GET /api/v1/units/prices
 * @desc    Get current global unit prices
 * @access  Public
 */
router.get("/prices", UnitController.getUnitPrices);

/**
 * @route   GET /api/v1/units/balance
 * @desc    Get current user's unit balance
 * @access  Private (Authenticated User)
 */
router.get("/balance", authenticate, UnitController.getMyBalance);

/**
 * @route   POST /api/v1/units/purchase
 * @desc    Simulate purchasing units (credit wallet)
 * @access  Private (Authenticated User)
 */
router.post("/purchase", authenticate, UnitController.purchaseUnits);

module.exports = router;
