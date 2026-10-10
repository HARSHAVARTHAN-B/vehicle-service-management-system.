const db = require('../config/database');

class Service {
  static async findAll({ search = '', status = '', page = 1, limit = 10 }) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      const pattern = `%${search.trim()}%`;
      conditions.push('(sr.service_id LIKE ? OR sr.booking_id LIKE ? OR v.registration_number LIKE ? OR sr.service_type LIKE ?)');
      params.push(pattern, pattern, pattern, pattern);
    }

    if (status) {
      conditions.push('sr.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) as total 
      FROM service_records sr
      LEFT JOIN vehicles v ON sr.vehicle_id = v.vehicle_id
      ${whereClause}
    `;
    const [countResult] = await db.query(countSql, params);
    const total = countResult[0].total;

    const dataSql = `
      SELECT 
        sr.*, 
        v.registration_number, v.brand as vehicle_brand, v.model as vehicle_model,
        m.name as mechanic_name,
        c.name as customer_name, c.customer_id
      FROM service_records sr
      LEFT JOIN vehicles v ON sr.vehicle_id = v.vehicle_id
      LEFT JOIN mechanics m ON sr.mechanic_id = m.mechanic_id
      LEFT JOIN bookings b ON sr.booking_id = b.booking_id
      LEFT JOIN customers c ON b.customer_id = c.customer_id
      ${whereClause}
      ORDER BY sr.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataSql, [...params, parsedLimit, offset]);

    return {
      services: rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1
      }
    };
  }

  static async findByServiceId(serviceId) {
    const [rows] = await db.query(`
      SELECT 
        sr.*, 
        v.registration_number, v.brand as vehicle_brand, v.model as vehicle_model,
        m.name as mechanic_name,
        c.name as customer_name, c.customer_id, c.phone as customer_phone
      FROM service_records sr
      LEFT JOIN vehicles v ON sr.vehicle_id = v.vehicle_id
      LEFT JOIN mechanics m ON sr.mechanic_id = m.mechanic_id
      LEFT JOIN bookings b ON sr.booking_id = b.booking_id
      LEFT JOIN customers c ON b.customer_id = c.customer_id
      WHERE sr.service_id = ? OR sr.id = ?
    `, [serviceId, serviceId]);
    return rows[0] || null;
  }

  static async create({
    service_id, booking_id, vehicle_id, mechanic_id, service_type,
    service_date, parts_cost = 0, labor_cost = 0, mechanic_notes = '', customer_feedback = '', status = 'Completed'
  }) {
    const total_cost = parseFloat(parts_cost || 0) + parseFloat(labor_cost || 0);

    const [result] = await db.query(
      `INSERT INTO service_records 
        (service_id, booking_id, vehicle_id, mechanic_id, service_type, service_date, parts_cost, labor_cost, total_cost, mechanic_notes, customer_feedback, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [service_id, booking_id, vehicle_id, mechanic_id || null, service_type, service_date, parts_cost, labor_cost, total_cost, mechanic_notes, customer_feedback, status]
    );
    return result.insertId;
  }

  static async update(serviceId, { booking_id, vehicle_id, mechanic_id, service_type, service_date, parts_cost = 0, labor_cost = 0, mechanic_notes, customer_feedback, status }) {
    const total_cost = parseFloat(parts_cost || 0) + parseFloat(labor_cost || 0);

    const [result] = await db.query(
      `UPDATE service_records 
       SET booking_id = ?, vehicle_id = ?, mechanic_id = ?, service_type = ?, service_date = ?, parts_cost = ?, labor_cost = ?, total_cost = ?, mechanic_notes = ?, customer_feedback = ?, status = ?
       WHERE service_id = ? OR id = ?`,
      [booking_id, vehicle_id, mechanic_id || null, service_type, service_date, parts_cost, labor_cost, total_cost, mechanic_notes, customer_feedback, status, serviceId, serviceId]
    );
    return result.affectedRows > 0;
  }

  static async delete(serviceId) {
    const [result] = await db.query('DELETE FROM service_records WHERE service_id = ? OR id = ?', [serviceId, serviceId]);
    return result.affectedRows > 0;
  }
}

module.exports = Service;
