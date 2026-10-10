const db = require('../config/database');

class Vehicle {
  static async findAll({ search = '', customerId = '', vehicleType = '', fuelType = '', page = 1, limit = 10 }) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      const pattern = `%${search.trim()}%`;
      conditions.push('(v.registration_number LIKE ? OR v.brand LIKE ? OR v.model LIKE ? OR v.vehicle_id LIKE ?)');
      params.push(pattern, pattern, pattern, pattern);
    }

    if (customerId) {
      conditions.push('v.customer_id = ?');
      params.push(customerId);
    }

    if (vehicleType) {
      conditions.push('v.vehicle_type = ?');
      params.push(vehicleType);
    }

    if (fuelType) {
      conditions.push('v.fuel_type = ?');
      params.push(fuelType);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM vehicles v ${whereClause}`;
    const [countResult] = await db.query(countSql, params);
    const total = countResult[0].total;

    const dataSql = `
      SELECT v.*, c.name as customer_name, c.phone as customer_phone
      FROM vehicles v
      LEFT JOIN customers c ON v.customer_id = c.customer_id
      ${whereClause}
      ORDER BY v.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataSql, [...params, parsedLimit, offset]);

    return {
      vehicles: rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1
      }
    };
  }

  static async findByVehicleId(vehicleId) {
    const [rows] = await db.query(`
      SELECT v.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
      FROM vehicles v
      LEFT JOIN customers c ON v.customer_id = c.customer_id
      WHERE v.vehicle_id = ? OR v.id = ?
    `, [vehicleId, vehicleId]);
    return rows[0] || null;
  }

  static async findByCustomerId(customerId) {
    const [rows] = await db.query('SELECT * FROM vehicles WHERE customer_id = ? ORDER BY id DESC', [customerId]);
    return rows;
  }

  static async create({
    vehicle_id, customer_id, registration_number, brand, model,
    vehicle_type = 'Car', fuel_type = 'Petrol', manufacturing_year, color, mileage = 0
  }) {
    const [result] = await db.query(
      `INSERT INTO vehicles 
        (vehicle_id, customer_id, registration_number, brand, model, vehicle_type, fuel_type, manufacturing_year, color, mileage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vehicle_id, customer_id, registration_number, brand, model, vehicle_type, fuel_type, manufacturing_year || null, color || '', mileage || 0]
    );
    return result.insertId;
  }

  static async update(vehicleId, { customer_id, registration_number, brand, model, vehicle_type, fuel_type, manufacturing_year, color, mileage }) {
    const [result] = await db.query(
      `UPDATE vehicles 
       SET customer_id = ?, registration_number = ?, brand = ?, model = ?, vehicle_type = ?, fuel_type = ?, manufacturing_year = ?, color = ?, mileage = ?
       WHERE vehicle_id = ? OR id = ?`,
      [customer_id, registration_number, brand, model, vehicle_type, fuel_type, manufacturing_year, color, mileage, vehicleId, vehicleId]
    );
    return result.affectedRows > 0;
  }

  static async delete(vehicleId) {
    const [result] = await db.query('DELETE FROM vehicles WHERE vehicle_id = ? OR id = ?', [vehicleId, vehicleId]);
    return result.affectedRows > 0;
  }
}

module.exports = Vehicle;
