const MediaService = require("../services/media.service");

class MediaController {
  /**
   * POST /api/v1/media/upload
   * Upload single file (image or video) to Cloudinary
   */
  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file provided. Please attach a file under 'file' key.",
        });
      }

      const folder = req.body.folder || "plusone_uploads";
      const result = await MediaService.uploadMedia(req.file, folder);

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Upload controller error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to upload file.",
      });
    }
  }

  /**
   * POST /api/v1/media/upload-multiple
   * Upload multiple files to Cloudinary
   */
  static async uploadMultipleFiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files provided.",
        });
      }

      const folder = req.body.folder || "plusone_uploads";
      const uploadPromises = req.files.map((file) => MediaService.uploadMedia(file, folder));
      const results = await Promise.all(uploadPromises);

      return res.status(201).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error("Multiple upload error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to upload files.",
      });
    }
  }
}

module.exports = MediaController;
