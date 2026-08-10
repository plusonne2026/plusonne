const PackageService = require("../services/package.service");
const { createPackageSchema, updatePackageSchema } = require("../validators/package.validator");

class PackageController {
  /**
   * POST /api/v1/packages
   * Create a new package (Admin only)
   */
  static async createPackage(req, res, next) {
    try {
      const { error, value } = createPackageSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          error: error.details[0].message,
        });
      }

      const existing = await PackageService.getPackageById(value.packageId);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Package with this ID already exists",
        });
      }

      const pkg = await PackageService.createPackage(value);

      return res.status(201).json({
        success: true,
        message: "Package created successfully",
        data: pkg,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/packages
   * Get all packages with optional filters (city, categoryId)
   */
  static async getAllPackages(req, res, next) {
    try {
      const includeInactive = req.query.includeInactive === "true";
      const city = req.query.city || null;
      const categoryId = req.query.categoryId || null;
      
      const packages = await PackageService.getAllPackages(includeInactive, city, categoryId);

      return res.status(200).json({
        success: true,
        data: packages,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/packages/:packageId
   * Get a specific package
   */
  static async getPackageById(req, res, next) {
    try {
      const { packageId } = req.params;
      const pkg = await PackageService.getPackageById(packageId);

      if (!pkg) {
        return res.status(404).json({
          success: false,
          message: "Package not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: pkg,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/packages/:packageId
   * Update a package (Admin only)
   */
  static async updatePackage(req, res, next) {
    try {
      const { packageId } = req.params;
      const { error, value } = updatePackageSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          error: error.details[0].message,
        });
      }

      const pkg = await PackageService.getPackageById(packageId);
      if (!pkg) {
        return res.status(404).json({
          success: false,
          message: "Package not found",
        });
      }

      const updated = await PackageService.updatePackage(packageId, value);

      return res.status(200).json({
        success: true,
        message: "Package updated successfully",
        data: { packageId, ...updated },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/packages/:packageId
   * Delete a package (Admin only)
   */
  static async deletePackage(req, res, next) {
    try {
      const { packageId } = req.params;
      
      const pkg = await PackageService.getPackageById(packageId);
      if (!pkg) {
        return res.status(404).json({
          success: false,
          message: "Package not found",
        });
      }

      await PackageService.deletePackage(packageId);

      return res.status(200).json({
        success: true,
        message: "Package deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PackageController;
