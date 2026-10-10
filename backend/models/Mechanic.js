const db = require('../config/database');

class Mechanic {
  static async findAll({ search = '', status = '', specialization = '', page = 1, limit = 10 }) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      const pattern = `%${search.trim()}%`;
      conditions.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR mechanic_id LIKE ?)');
      params.push(pattern, pattern, pattern, pattern);
    }

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (specialization) {
      conditions.push('specialization = ?');
      params.push(specialization);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM mechanics ${whereClause}`;
    const [countResult] = await db.query(countSql, params);
    const total = countResult[0].total;

    const dataSql = `
      SELECT m.*,
        (SELECT COUNT(*) FROM bookings b WHERE b.mechanic_id = m.mechanic_id AND b.status IN ('Confirmed', 'In Progress')) as active_tasks
      FROM mechanics m
      ${whereClause}
      ORDER BY m.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataSql, [...params, parsedLimit, offset]);

    return {
      mechanics: rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1
      }
    };
  }

  static async findAvailable() {
    const [rows] = await db.query(
      "SELECT * FROM mechanics WHERE status = 'Available' AND availability = TRUE ORDER BY name ASC"
    );
    return rows;
  }

  static async findByMechanicId(mechanicId) {
    const [rows] = await db.query('SELECT * FROM mechanics WHERE mechanic_id = ? OR id = ?', [mechanicId, mechanicId]);
    return rows[0] || null;
  }

  static async create({ mechanic_id, name, phone, email, specialization = 'General Service', experience = '1 Year', joining_date, status = 'Available' }) {
    const isAvailable = status === 'Available';
    const [result] = await db.query(
      `INSERT INTO mechanics 
        (mechanic_id, name, phone, email, specialization, experience, joining_date, availability, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [mechanic_id, name, phone, email || '', specialization, experience, joining_date || new Date().toISOString().split('T')[0], isAvailable, status]
    );
    return result.insertId;
  }

  static async update(mechanicId, { name, phone, email, specialization, experience, joining_date, status }) {
    const isAvailable = status === 'Available';
    const [result] = await db.query(
      `UPDATE mechanics 
       SET name = ?, phone = ?, email = ?, specialization = ?, experience = ?, joining_date = ?, availability = ?, status = ?
       WHERE mechanic_id = ? OR id = ?`,
      [name, phone, email, specialization, experience, joining_date, isAvailable, status, mechanicId, mechanicId]
    );
    return result.affectedRows > 0;
  }

  static async updateStatus(mechanicId, status) {
    const isAvailable = status === 'Available';
    const [result] = await db.query(
      'UPDATE mechanics SET status = ?, availability = ? WHERE mechanic_id = ? OR id = ?',
      [status, isAvailable, mechanicId, mechanicId]
    );
    return result.affectedRows > 0;
  }

  static async delete(mechanicId) {
    const [result] = await db.query('DELETE FROM mechanics WHERE mechanic_id = ? OR id = ?', [mechanicId, mechanicId]);
    return result.affectedRows > 0;
  }
}

module.exports = Mechanic;
