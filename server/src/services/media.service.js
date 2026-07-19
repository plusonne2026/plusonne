const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary.config");

class MediaService {
  /**
   * Upload file buffer to Cloudinary (or fallback to base64 data URI if Cloudinary keys not provided)
   */
  static async uploadMedia(file, folder = "plusone_uploads") {
    if (!file || !file.buffer) {
      throw new Error("No file buffer provided for upload.");
    }

    // Check if Cloudinary API keys are configured in .env
    if (isCloudinaryConfigured()) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary Upload Error:", error);
              return reject(error);
            }
            resolve({
              success: true,
              url: result.secure_url,
              publicId: result.public_id,
              resourceType: result.resource_type,
              format: result.format,
            });
          }
        );

        uploadStream.end(file.buffer);
      });
    } else {
      console.warn("⚠️ Cloudinary API keys not set in .env (CLOUDINARY_API_KEY). Using Base64 Data URI fallback for local testing.");
      const base64String = file.buffer.toString("base64");
      const dataUri = `data:${file.mimetype || "image/jpeg"};base64,${base64String}`;
      
      return {
        success: true,
        url: dataUri,
        publicId: `local_fallback_${Date.now()}`,
        resourceType: file.mimetype?.startsWith("video/") ? "video" : "image",
        note: "Uploaded as Local Data URI. Add CLOUDINARY_API_KEY in .env for live Cloudinary storage.",
      };
    }
  }

  /**
   * Delete media from Cloudinary by public ID
   */
  static async deleteMedia(publicId, resourceType = "image") {
    if (!isCloudinaryConfigured() || publicId.startsWith("local_fallback_")) {
      return { success: true, message: "Local fallback item removed." };
    }

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return { success: true, result };
  }
}

module.exports = MediaService;
