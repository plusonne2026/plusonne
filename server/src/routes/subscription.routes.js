const express = require("express");
const router = express.Router();
const SubscriptionController = require("../controllers/subscription.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { ROLES } = require("../config/constants");

// ── 1. GET /subscriptions/plans — Public ──
router.get("/plans", SubscriptionController.getPlans);

// Protected routes below
router.use(authMiddleware.authenticate);

// ── 2. POST /subscriptions/subscribe — user only ──
router.post("/subscribe", requireRole(ROLES.USER), SubscriptionController.subscribe);

// ── 3. GET /subscriptions/my — user only ──
router.get("/my", requireRole(ROLES.USER), SubscriptionController.getMySubscription);

// ── 4. PUT /subscriptions/:subId/cancel — user only ──
router.put("/:subId/cancel", requireRole(ROLES.USER), SubscriptionController.cancelSubscription);

// ── 5. PUT /subscriptions/:subId/toggle-autorenew — user only ──
router.put("/:subId/toggle-autorenew", requireRole(ROLES.USER), SubscriptionController.toggleAutoRenew);

module.exports = router;
