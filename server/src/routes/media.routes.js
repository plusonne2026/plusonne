const express = require("express");
const multer = require("multer");
const MediaController = require("../controllers/media.controller");

const router = express.Router();

// Use memory storage for direct Cloudinary upload buffer stream
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for photos & video reviews
  },
});

// Single file upload route
router.post("/upload", upload.single("file"), MediaController.uploadFile);

// Multiple files upload route (up to 10 files)
router.post("/upload-multiple", upload.array("files", 10), MediaController.uploadMultipleFiles);

module.exports = router;
