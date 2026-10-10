const db = require('../config/database');

/**
 * Generate unique sequential prefix-based domain IDs (e.g., CUS-1001, VS-1001)
 * @param {string} table Database table name
 * @param {string} column Unique ID column name (e.g. customer_id, booking_id)
 * @param {string} prefix ID prefix (e.g. CUS, VS, MEC, PAY)
 * @param {number} startNumeric Starting numeric counter (e.g. 1000)
 */
async function generateUniqueId(table, column, prefix, startNumeric = 1000) {
  const [rows] = await db.query(
    `SELECT ${column} FROM ${table} WHERE ${column} LIKE ? ORDER BY id DESC LIMIT 1`,
    [`${prefix}-%`]
  );

  if (rows.length === 0) {
    return `${prefix}-${startNumeric + 1}`;
  }

  const lastId = rows[0][column];
  const parts = lastId.split('-');
  const lastNum = parseInt(parts[parts.length - 1], 10);
  const nextNum = isNaN(lastNum) ? startNumeric + 1 : lastNum + 1;

  return `${prefix}-${nextNum}`;
}

module.exports = {
  generateUniqueId
};
