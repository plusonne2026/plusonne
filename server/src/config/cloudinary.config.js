const cloudinary = require("cloudinary").v2;
const config = require("./env");

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

const isCloudinaryConfigured = () => {
  return (
    config.cloudinary.cloudName &&
    config.cloudinary.cloudName !== "demo" &&
    config.cloudinary.apiKey &&
    config.cloudinary.apiSecret
  );
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
};
