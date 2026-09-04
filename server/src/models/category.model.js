/**
 * Category Model
 *
 * Creates a normalized PlusOne_Categories table document
 * matching backend_documentation.md Table 4 specs.
 *
 * | Attribute | Type | Description |
 * |-----------|------|-------------|
 * | categoryId (PK) | String | Slug: coffee_date, explorer, etc. |
 * | name | String | Display name: "Coffee Date" |
 * | description | String | Category description |
 * | iconUrl | String | Cloudinary URL for category icon |
 * | isActive | Boolean | Enabled/disabled |
 * | displayOrder | Number | Sort order on home screen |
 * | createdAt | String (ISO) | Creation timestamp |
 */
function formatCategoryModel(payload) {
  const now = new Date().toISOString();

  return {
    categoryId: payload.categoryId, // Slug: e.g. "coffee_date"
    name: payload.name,
    description: payload.description || "",
    iconUrl: payload.iconUrl || null,
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    displayOrder: typeof payload.displayOrder === "number" ? payload.displayOrder : 0,
    createdAt: payload.createdAt || now,
    updatedAt: now,
  };
}

module.exports = {
  formatCategoryModel,
};
