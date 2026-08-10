const DynamoDBHelper = require("../clients/dynamodb.client");
const config = require("../config/env");

const PACKAGES_TABLE = config.tables.packages;

class PackageService {
  static async createPackage(payload) {
    const pkg = {
      ...payload,
      createdAt: new Date().toISOString(),
    };
    await DynamoDBHelper.putItem(PACKAGES_TABLE, pkg);
    return pkg;
  }

  static async getPackageById(packageId) {
    return await DynamoDBHelper.getItem(PACKAGES_TABLE, { packageId });
  }

  static async getAllPackages(includeInactive = false, city = null, categoryId = null) {
    // For MVP, we will use a scan and filter in memory, 
    // or use the CategoryCityIndex if both category and city are provided.
    
    if (city && categoryId) {
      const params = {
        TableName: PACKAGES_TABLE,
        IndexName: "CategoryCityIndex",
        KeyConditionExpression: "categoryId = :cId AND city = :city",
        ExpressionAttributeValues: {
          ":cId": categoryId,
          ":city": city
        }
      };
      let packages = await DynamoDBHelper.queryItems(params);
      if (!includeInactive) {
        packages = packages.filter(p => p.isActive);
      }
      return packages.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
    
    // Fallback to scan
    const params = {
      TableName: PACKAGES_TABLE,
    };
    
    let packages = await DynamoDBHelper.scanItems(params);
    
    if (!includeInactive) packages = packages.filter(p => p.isActive);
    if (city) packages = packages.filter(p => p.city === city);
    if (categoryId) packages = packages.filter(p => p.categoryId === categoryId);
    
    return packages.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  static async updatePackage(packageId, payload) {
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
      PACKAGES_TABLE,
      { packageId },
      updateExpression,
      Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      expressionAttributeValues
    );
    return updated;
  }

  static async deletePackage(packageId) {
    await DynamoDBHelper.deleteItem(PACKAGES_TABLE, { packageId });
    return true;
  }
}

module.exports = PackageService;
