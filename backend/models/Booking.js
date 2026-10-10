const db = require('../config/database');

class Booking {
  static async findAll({ search = '', status = '', date = '', page = 1, limit = 10 }) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      const pattern = `%${search.trim()}%`;
      conditions.push('(b.booking_id LIKE ? OR c.name LIKE ? OR v.registration_number LIKE ? OR b.service_type LIKE ?)');
      params.push(pattern, pattern, pattern, pattern);
    }

    if (status) {
      conditions.push('b.status = ?');
      params.push(status);
    }

    if (date) {
      conditions.push('b.booking_date = ?');
      params.push(date);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) as total 
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.customer_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      ${whereClause}
    `;
    const [countResult] = await db.query(countSql, params);
    const total = countResult[0].total;

    const dataSql = `
      SELECT 
        b.*, 
        c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
        v.registration_number, v.brand as vehicle_brand, v.model as vehicle_model,
        m.name as mechanic_name
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.customer_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      LEFT JOIN mechanics m ON b.mechanic_id = m.mechanic_id
      ${whereClause}
      ORDER BY b.booking_date DESC, b.booking_time DESC, b.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataSql, [...params, parsedLimit, offset]);

    return {
      bookings: rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1
      }
    };
  }

  static async findToday() {
    const todayStr = new Date().toISOString().split('T')[0];
    const [rows] = await db.query(`
      SELECT 
        b.*, 
        c.name as customer_name, c.phone as customer_phone,
        v.registration_number, v.brand as vehicle_brand, v.model as vehicle_model,
        m.name as mechanic_name
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.customer_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      LEFT JOIN mechanics m ON b.mechanic_id = m.mechanic_id
      WHERE b.booking_date = ?
      ORDER BY b.booking_time ASC
    `, [todayStr]);
    return rows;
  }

  static async findUpcoming() {
    const todayStr = new Date().toISOString().split('T')[0];
    const [rows] = await db.query(`
      SELECT 
        b.*, 
        c.name as customer_name, c.phone as customer_phone,
        v.registration_number, v.brand as vehicle_brand, v.model as vehicle_model,
        m.name as mechanic_name
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.customer_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      LEFT JOIN mechanics m ON b.mechanic_id = m.mechanic_id
      WHERE b.booking_date >= ? AND b.status IN ('Pending', 'Confirmed')
      ORDER BY b.booking_date ASC, b.booking_time ASC
      LIMIT 10
    `, [todayStr]);
    return rows;
  }

  static async findByBookingId(bookingId) {
    const [rows] = await db.query(`
      SELECT 
        b.*, 
        c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
        v.registration_number, v.brand as vehicle_brand, v.model as vehicle_model, v.fuel_type,
        m.name as mechanic_name
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.customer_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      LEFT JOIN mechanics m ON b.mechanic_id = m.mechanic_id
      WHERE b.booking_id = ? OR b.id = ?
    `, [bookingId, bookingId]);
    return rows[0] || null;
  }

  static async create({
    booking_id, customer_id, vehicle_id, mechanic_id, service_type,
    booking_date, booking_time, problem_description, estimated_cost = 0, status = 'Pending'
  }) {
    const [result] = await db.query(
      `INSERT INTO bookings 
        (booking_id, customer_id, vehicle_id, mechanic_id, service_type, booking_date, booking_time, problem_description, estimated_cost, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [booking_id, customer_id, vehicle_id, mechanic_id || null, service_type, booking_date, booking_time, problem_description || '', estimated_cost, status]
    );
    return result.insertId;
  }

  static async update(bookingId, { customer_id, vehicle_id, mechanic_id, service_type, booking_date, booking_time, problem_description, estimated_cost, status }) {
    const [result] = await db.query(
      `UPDATE bookings 
       SET customer_id = ?, vehicle_id = ?, mechanic_id = ?, service_type = ?, booking_date = ?, booking_time = ?, problem_description = ?, estimated_cost = ?, status = ?
       WHERE booking_id = ? OR id = ?`,
      [customer_id, vehicle_id, mechanic_id || null, service_type, booking_date, booking_time, problem_description, estimated_cost, status, bookingId, bookingId]
    );
    return result.affectedRows > 0;
  }

  static async updateStatus(bookingId, status) {
    const [result] = await db.query(
      'UPDATE bookings SET status = ? WHERE booking_id = ? OR id = ?',
      [status, bookingId, bookingId]
    );
    return result.affectedRows > 0;
  }

  static async delete(bookingId) {
    const [result] = await db.query('DELETE FROM bookings WHERE booking_id = ? OR id = ?', [bookingId, bookingId]);
    return result.affectedRows > 0;
  }
}

module.exports = Booking;
