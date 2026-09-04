/**
 * Category DTO (Data Transfer Object)
 *
 * Defines how Category responses are formatted and presented to the client/frontend.
 */

/**
 * Single Category output format
 */
function toCategoryDto(category) {
  if (!category) return null;

  return {
    categoryId:   category.categoryId,
    name:         category.name,
    description:  category.description || "",
    iconUrl:      category.iconUrl || null,
    isActive:     category.isActive !== undefined ? category.isActive : true,
    displayOrder: category.displayOrder || 0,
    createdAt:    category.createdAt,
    updatedAt:    category.updatedAt || category.createdAt,
  };
}

/**
 * Multiple Categories list output format
 */
function toCategoryListDto(categories) {
  if (!Array.isArray(categories)) return [];
  return categories.map(toCategoryDto);
}

module.exports = {
  toCategoryDto,
  toCategoryListDto,
};
