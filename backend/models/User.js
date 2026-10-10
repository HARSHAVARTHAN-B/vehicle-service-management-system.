const db = require('../config/database');

class User {
  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create({ name, email, password, role = 'staff', phone }) {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, role, phone || null]
    );
    return result.insertId;
  }
}

module.exports = User;
