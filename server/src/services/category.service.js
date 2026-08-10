const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");

const CATEGORIES_TABLE = config.tables.categories;

class CategoryService {
  static async createCategory(payload) {
    const category = {
      ...payload,
      createdAt: new Date().toISOString(),
    };
    await DynamoDBHelper.putItem(CATEGORIES_TABLE, category);
    return category;
  }

  static async getCategoryById(categoryId) {
    return await DynamoDBHelper.getItem(CATEGORIES_TABLE, { categoryId });
  }

  static async getAllCategories(includeInactive = false) {
    const params = {
      TableName: CATEGORIES_TABLE,
    };
    
    // In DynamoDB, scan is okay for small tables like categories.
    const categories = await DynamoDBHelper.scanItems(params);
    
    if (!includeInactive) {
      return categories.filter(c => c.isActive).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
    return categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  static async updateCategory(categoryId, payload) {
    const now = new Date().toISOString();
    
    let updateExpression = "SET updatedAt = :now";
    const expressionAttributeValues = { ":now": now };
    const expressionAttributeNames = {};
    
    for (const [key, value] of Object.entries(payload)) {
      updateExpression += `, #key_${key} = :val_${key}`;
      expressionAttributeNames[`#key_${key}`] = key;
      expressionAttributeValues[`:val_${key}`] = value;
    }

    const updated = await DynamoDBHelper.updateItem(
      CATEGORIES_TABLE,
      { categoryId },
      updateExpression,
      Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      expressionAttributeValues
    );
    return updated;
  }

  static async deleteCategory(categoryId) {
    await DynamoDBHelper.deleteItem(CATEGORIES_TABLE, { categoryId });
    return true;
  }
}

module.exports = CategoryService;
