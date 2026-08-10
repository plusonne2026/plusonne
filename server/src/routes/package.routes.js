const express = require("express");
const PackageController = require("../controllers/package.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { ROLES } = require("../config/constants");

const router = express.Router();

// Public routes
router.get("/", PackageController.getAllPackages);
router.get("/:packageId", PackageController.getPackageById);

// Admin only routes
router.post(
  "/",
  authenticate,
  requireRole(ROLES.ADMIN),
  PackageController.createPackage
);

router.put(
  "/:packageId",
  authenticate,
  requireRole(ROLES.ADMIN),
  PackageController.updatePackage
);

router.delete(
  "/:packageId",
  authenticate,
  requireRole(ROLES.ADMIN),
  PackageController.deletePackage
);

module.exports = router;
