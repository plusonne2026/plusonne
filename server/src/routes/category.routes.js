const express = require("express");
const CategoryController = require("../controllers/category.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { ROLES } = require("../config/constants");

const router = express.Router();

// Public routes
router.get("/", CategoryController.getAllCategories);
router.get("/:categoryId", CategoryController.getCategoryById);

// Admin only routes
router.post(
  "/",
  authenticate,
  requireRole(ROLES.ADMIN),
  CategoryController.createCategory
);

router.put(
  "/:categoryId",
  authenticate,
  requireRole(ROLES.ADMIN),
  CategoryController.updateCategory
);

router.delete(
  "/:categoryId",
  authenticate,
  requireRole(ROLES.ADMIN),
  CategoryController.deleteCategory
);

module.exports = router;
