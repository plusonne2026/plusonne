const express = require("express");
const PaymentController = require("../controllers/payment.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

// Routes require authentication
router.use(authenticate);

router.post("/create-order", PaymentController.createOrder);
router.post("/verify", PaymentController.verifyPayment);

module.exports = router;
