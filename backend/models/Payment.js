const db = require('../config/database');

class Payment {
  static async findAll({ search = '', status = '', paymentMethod = '', page = 1, limit = 10 }) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      const pattern = `%${search.trim()}%`;
      conditions.push('(p.payment_id LIKE ? OR p.booking_id LIKE ? OR p.transaction_reference LIKE ? OR c.name LIKE ?)');
      params.push(pattern, pattern, pattern, pattern);
    }

    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }

    if (paymentMethod) {
      conditions.push('p.payment_method = ?');
      params.push(paymentMethod);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) as total 
      FROM payments p
      LEFT JOIN customers c ON p.customer_id = c.customer_id
      ${whereClause}
    `;
    const [countResult] = await db.query(countSql, params);
    const total = countResult[0].total;

    const dataSql = `
      SELECT 
        p.*, 
        c.name as customer_name, c.phone as customer_phone,
        b.service_type
      FROM payments p
      LEFT JOIN customers c ON p.customer_id = c.customer_id
      LEFT JOIN bookings b ON p.booking_id = b.booking_id
      ${whereClause}
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataSql, [...params, parsedLimit, offset]);

    return {
      payments: rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1
      }
    };
  }

  static async findByPaymentId(paymentId) {
    const [rows] = await db.query(`
      SELECT 
        p.*, 
        c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
        b.service_type, b.booking_date
      FROM payments p
      LEFT JOIN customers c ON p.customer_id = c.customer_id
      LEFT JOIN bookings b ON p.booking_id = b.booking_id
      WHERE p.payment_id = ? OR p.id = ?
    `, [paymentId, paymentId]);
    return rows[0] || null;
  }

  static async create({
    payment_id, booking_id, customer_id, amount, payment_method = 'Cash',
    payment_date, status = 'Paid', transaction_reference = ''
  }) {
    const [result] = await db.query(
      `INSERT INTO payments 
        (payment_id, booking_id, customer_id, amount, payment_method, payment_date, status, transaction_reference)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [payment_id, booking_id, customer_id, amount, payment_method, payment_date || new Date().toISOString().split('T')[0], status, transaction_reference || '']
    );
    return result.insertId;
  }

  static async update(paymentId, { booking_id, customer_id, amount, payment_method, payment_date, status, transaction_reference }) {
    const [result] = await db.query(
      `UPDATE payments 
       SET booking_id = ?, customer_id = ?, amount = ?, payment_method = ?, payment_date = ?, status = ?, transaction_reference = ?
       WHERE payment_id = ? OR id = ?`,
      [booking_id, customer_id, amount, payment_method, payment_date, status, transaction_reference, paymentId, paymentId]
    );
    return result.affectedRows > 0;
  }

  static async delete(paymentId) {
    const [result] = await db.query('DELETE FROM payments WHERE payment_id = ? OR id = ?', [paymentId, paymentId]);
    return result.affectedRows > 0;
  }
}

module.exports = Payment;
