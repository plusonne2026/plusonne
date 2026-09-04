/**
 * Package DTO (Data Transfer Object)
 *
 * Defines standard client-facing response format for packages.
 */

/**
 * Single Package output format
 */
function toPackageDto(pkg) {
  if (!pkg) return null;

  return {
    packageId:          pkg.packageId,
    categoryId:         pkg.categoryId,
    name:               pkg.name,
    description:        pkg.description || "",
    durationHours:      pkg.durationHours,
    distanceKm:         pkg.distanceKm,
    basePrice:          pkg.basePrice,
    images:             pkg.images || [],
    inclusions:         pkg.inclusions || [],
    extraCharges:       pkg.extraCharges || {
      perExtraHour: 0,
      perExtraKm: 0,
    },
    cancellationPolicy: pkg.cancellationPolicy || {
      freeCancelHoursBefore: 24,
      cancellationFee: 0,
    },
    city:               pkg.city,
    isActive:           pkg.isActive !== undefined ? pkg.isActive : true,
    popularity:         pkg.popularity || 0,
    createdAt:          pkg.createdAt,
    updatedAt:          pkg.updatedAt || pkg.createdAt,
  };
}

/**
 * Multiple Packages list output format
 */
function toPackageListDto(packages) {
  if (!Array.isArray(packages)) return [];
  return packages.map(toPackageDto);
}

module.exports = {
  toPackageDto,
  toPackageListDto,
};
