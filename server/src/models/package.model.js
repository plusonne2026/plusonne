const { v4: uuidv4 } = require("uuid");

/**
 * Package Model
 *
 * Creates a normalized PlusOne_Packages table document
 * matching backend_documentation.md Table 5 specs.
 *
 * | Attribute | Type | Description |
 * |-----------|------|-------------|
 * | packageId (PK) | String (UUID) | Unique package ID |
 * | categoryId | String | Category slug this belongs to |
 * | name | String | Display name, e.g. "Delhi Heritage Tour" |
 * | description | String | Detailed description |
 * | durationHours | Number | Included time (hours) |
 * | distanceKm | Number | Included distance (km) |
 * | basePrice | Number | Base price in INR |
 * | images | List | Cloudinary URLs |
 * | inclusions | List | What's included (text items) |
 * | extraCharges | Map | { perExtraHour: 200, perExtraKm: 15 } |
 * | cancellationPolicy | Map | { freeCancelHoursBefore: 24, cancellationFee: 100 } |
 * | city | String | City where this package is available |
 * | isActive | Boolean | Enabled / disabled |
 * | popularity | Number | Booking count for sorting |
 * | createdAt | String (ISO) | Creation timestamp |
 * | updatedAt | String (ISO) | Last update timestamp |
 */
function formatPackageModel(payload) {
  const now = new Date().toISOString();

  return {
    packageId: payload.packageId || uuidv4(),
    categoryId: payload.categoryId,
    name: payload.name,
    description: payload.description || "",
    durationHours: Number(payload.durationHours) || 1,
    distanceKm: Number(payload.distanceKm) || 0,
    basePrice: Number(payload.basePrice) || 0,
    images: Array.isArray(payload.images) ? payload.images : [],
    inclusions: Array.isArray(payload.inclusions) ? payload.inclusions : [],
    extraCharges: payload.extraCharges || {
      perExtraHour: 0,
      perExtraKm: 0,
    },
    cancellationPolicy: payload.cancellationPolicy || {
      freeCancelHoursBefore: 24,
      cancellationFee: 0,
    },
    city: payload.city || "",
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    popularity: Number(payload.popularity) || 0,
    createdAt: payload.createdAt || now,
    updatedAt: now,
  };
}

module.exports = {
  formatPackageModel,
};
