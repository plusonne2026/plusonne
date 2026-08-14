const express = require("express");
const router = express.Router();

/**
 * @route   GET /api/v1/geocode/reverse
 * @desc    Reverse geocode lat/lng to an address using OpenStreetMap Nominatim
 * @access  Public (or authenticated)
 */
router.get("/reverse", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude (lat) and Longitude (lng) are required",
      });
    }

    // Call Nominatim API server-to-server to avoid CORS and browser User-Agent restrictions
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          "Accept-Language": "en",
          // Nominatim requires a valid User-Agent identifying the application
          "User-Agent": "PlusOnneApp/1.0 (Contact: admin@plusonne.com)",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Geocoding Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reverse geocode coordinates",
      error: error.message,
    });
  }
});

module.exports = router;
