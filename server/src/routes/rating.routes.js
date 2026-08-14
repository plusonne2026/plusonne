const express = require("express");
const RatingController = require("../controllers/rating.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/", RatingController.submitRating);

module.exports = router;
