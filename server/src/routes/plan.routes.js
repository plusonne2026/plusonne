const express = require("express");
const PlanController = require("../controllers/plan.controller");

const router = express.Router();

/**
 * @route   GET /api/v1/plans
 * @desc    Get all active subscription plans
 * @access  Public
 */
router.get("/", PlanController.getActivePlans);

module.exports = router;
