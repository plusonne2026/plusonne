const CategoryService = require("../services/category.service");
const { createCategorySchema, updateCategorySchema } = require("../validators/category.validator");

class CategoryController {
  /**
   * POST /api/v1/categories
   * Create a new category (Admin only)
   */
  static async createCategory(req, res, next) {
    try {
      const { error, value } = createCategorySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          error: error.details[0].message,
        });
      }

      // Check if category already exists
      const existing = await CategoryService.getCategoryById(value.categoryId);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Category with this ID already exists",
        });
      }

      const category = await CategoryService.createCategory(value);

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/categories
   * Get all categories
   */
  static async getAllCategories(req, res, next) {
    try {
      const includeInactive = req.query.includeInactive === "true";
      const categories = await CategoryService.getAllCategories(includeInactive);

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/categories/:categoryId
   * Get a specific category
   */
  static async getCategoryById(req, res, next) {
    try {
      const { categoryId } = req.params;
      const category = await CategoryService.getCategoryById(categoryId);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/categories/:categoryId
   * Update a category (Admin only)
   */
  static async updateCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      const { error, value } = updateCategorySchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          error: error.details[0].message,
        });
      }

      const category = await CategoryService.getCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      const updated = await CategoryService.updateCategory(categoryId, value);

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: { categoryId, ...updated },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/categories/:categoryId
   * Delete a category (Admin only)
   */
  static async deleteCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      
      const category = await CategoryService.getCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      await CategoryService.deleteCategory(categoryId);

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CategoryController;
