const db = require('../config/database');

class Customer {
  static async findAll({ search = '', page = 1, limit = 10 }) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    let whereClause = '';
    const queryParams = [];

    if (search && search.trim() !== '') {
      whereClause = 'WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR customer_id LIKE ?';
      const searchPattern = `%${search.trim()}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const countSql = `SELECT COUNT(*) as total FROM customers ${whereClause}`;
    const [countResult] = await db.query(countSql, queryParams);
    const total = countResult[0].total;

    const dataSql = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM vehicles v WHERE v.customer_id = c.customer_id) as vehicle_count
      FROM customers c
      ${whereClause}
      ORDER BY c.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataSql, [...queryParams, parsedLimit, offset]);

    return {
      customers: rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1
      }
    };
  }

  static async findByCustomerId(customerId) {
    const [rows] = await db.query('SELECT * FROM customers WHERE customer_id = ? OR id = ?', [customerId, customerId]);
    return rows[0] || null;
  }

  static async create({ customer_id, name, email, phone, address }) {
    const [result] = await db.query(
      'INSERT INTO customers (customer_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [customer_id, name, email, phone, address || '']
    );
    return result.insertId;
  }

  static async update(customerId, { name, email, phone, address }) {
    const [result] = await db.query(
      'UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE customer_id = ? OR id = ?',
      [name, email, phone, address, customerId, customerId]
    );
    return result.affectedRows > 0;
  }

  static async delete(customerId) {
    const [result] = await db.query(
      'DELETE FROM customers WHERE customer_id = ? OR id = ?',
      [customerId, customerId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Customer;
