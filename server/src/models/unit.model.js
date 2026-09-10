/**
 * Unit Model — PlusOne_UnitBalances (Table 8)
 *
 * User's purchased time/distance unit balances.
 *
 * | Attribute           | Type          | Description            |
 * |---------------------|---------------|------------------------|
 * | userId (PK)         | String        | User ID                |
 * | hoursBalance        | Number        | Available hours        |
 * | kmBalance           | Number        | Available kilometers   |
 * | totalHoursPurchased | Number        | Lifetime total         |
 * | totalKmPurchased    | Number        | Lifetime total         |
 * | totalHoursUsed      | Number        | Lifetime used          |
 * | totalKmUsed         | Number        | Lifetime used          |
 * | lastUpdated         | String (ISO)  | Last balance update    |
 */

/**
 * Formats and normalizes a UnitBalances document for DynamoDB Table 8
 * @param {Object} payload
 * @returns {Object} normalized unit balance item
 */
function formatUnitBalanceModel(payload) {
  const now = new Date().toISOString();

  return {
    userId: payload.userId,
    hoursBalance: Math.max(0, Number(payload.hoursBalance) || 0),
    kmBalance: Math.max(0, Number(payload.kmBalance) || 0),
    totalHoursPurchased: Math.max(0, Number(payload.totalHoursPurchased) || 0),
    totalKmPurchased: Math.max(0, Number(payload.totalKmPurchased) || 0),
    totalHoursUsed: Math.max(0, Number(payload.totalHoursUsed) || 0),
    totalKmUsed: Math.max(0, Number(payload.totalKmUsed) || 0),
    lastUpdated: payload.lastUpdated || now,
  };
}

/**
 * Formats public response for unit balance
 * @param {Object} balance 
 * @returns {Object}
 */
function formatUnitBalanceResponse(balance) {
  if (!balance) return null;

  return {
    userId: balance.userId,
    hoursBalance: balance.hoursBalance,
    kmBalance: balance.kmBalance,
    totalHoursPurchased: balance.totalHoursPurchased,
    totalKmPurchased: balance.totalKmPurchased,
    totalHoursUsed: balance.totalHoursUsed,
    totalKmUsed: balance.totalKmUsed,
    lastUpdated: balance.lastUpdated,
  };
}

module.exports = {
  formatUnitBalanceModel,
  formatUnitBalanceResponse,
};
