const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'autocare_db';

let mode = 'mysql'; // 'mysql' or 'sqlite'
let pool = null;
let sqliteDb = null;

function translateQueryForSqlite(sql) {
  let translated = sql
    .replace(/DATE_FORMAT\(([^,]+),\s*'%b %Y'\)/gi, "strftime('%Y-%m', $1)")
    .replace(/DATE_FORMAT\(([^,]+),\s*'%Y-%m'\)/gi, "strftime('%Y-%m', $1)")
    .replace(/DATE_FORMAT\(([^,]+),\s*'%Y-%m-%d'\)/gi, "strftime('%Y-%m-%d', $1)");
  return translated;
}

function runSqliteQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    const cleanSql = translateQueryForSqlite(sql);
    const trimmed = cleanSql.trim().toUpperCase();

    if (trimmed.startsWith('SELECT')) {
      sqliteDb.all(cleanSql, params, (err, rows) => {
        if (err) return reject(err);
        resolve([rows, []]);
      });
    } else {
      sqliteDb.run(cleanSql, params, function (err) {
        if (err) return reject(err);
        resolve([{ insertId: this.lastID, affectedRows: this.changes }, []]);
      });
    }
  });
}

async function initSqliteDatabase() {
  const dbDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'autocare.db');

  sqliteDb = new sqlite3.Database(dbPath);

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'staff',
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      registration_number TEXT UNIQUE NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      vehicle_type TEXT NOT NULL DEFAULT 'Car',
      fuel_type TEXT NOT NULL DEFAULT 'Petrol',
      manufacturing_year INTEGER,
      color TEXT,
      mileage INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS mechanics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mechanic_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      specialization TEXT NOT NULL DEFAULT 'General Service',
      experience TEXT,
      joining_date DATE,
      availability BOOLEAN DEFAULT 1,
      status TEXT DEFAULT 'Available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      vehicle_id TEXT NOT NULL,
      mechanic_id TEXT,
      service_type TEXT NOT NULL,
      booking_date DATE NOT NULL,
      booking_time TIME NOT NULL,
      problem_description TEXT,
      estimated_cost REAL DEFAULT 0.00,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS service_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id TEXT UNIQUE NOT NULL,
      booking_id TEXT NOT NULL,
      vehicle_id TEXT NOT NULL,
      mechanic_id TEXT,
      service_type TEXT NOT NULL,
      service_date DATE NOT NULL,
      parts_cost REAL DEFAULT 0.00,
      labor_cost REAL DEFAULT 0.00,
      total_cost REAL DEFAULT 0.00,
      mechanic_notes TEXT,
      customer_feedback TEXT,
      status TEXT DEFAULT 'Completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_id TEXT UNIQUE NOT NULL,
      booking_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'Cash',
      payment_date DATE NOT NULL,
      status TEXT DEFAULT 'Paid',
      transaction_reference TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  for (const tableSql of tables) {
    await runSqliteQuery(tableSql);
  }

  const indexes = [
    `CREATE INDEX IF NOT EXISTS idx_customer_email ON customers (email);`,
    `CREATE INDEX IF NOT EXISTS idx_customer_phone ON customers (phone);`,
    `CREATE INDEX IF NOT EXISTS idx_vehicle_customer ON vehicles (customer_id);`,
    `CREATE INDEX IF NOT EXISTS idx_vehicle_reg ON vehicles (registration_number);`,
    `CREATE INDEX IF NOT EXISTS idx_mechanic_status ON mechanics (status);`,
    `CREATE INDEX IF NOT EXISTS idx_booking_customer ON bookings (customer_id);`,
    `CREATE INDEX IF NOT EXISTS idx_booking_vehicle ON bookings (vehicle_id);`,
    `CREATE INDEX IF NOT EXISTS idx_booking_mechanic ON bookings (mechanic_id);`,
    `CREATE INDEX IF NOT EXISTS idx_booking_status ON bookings (status);`,
    `CREATE INDEX IF NOT EXISTS idx_service_booking ON service_records (booking_id);`,
    `CREATE INDEX IF NOT EXISTS idx_service_vehicle ON service_records (vehicle_id);`,
    `CREATE INDEX IF NOT EXISTS idx_payment_booking ON payments (booking_id);`,
    `CREATE INDEX IF NOT EXISTS idx_payment_customer ON payments (customer_id);`,
    `CREATE INDEX IF NOT EXISTS idx_payment_status ON payments (status);`
  ];

  for (const idxSql of indexes) {
    await runSqliteQuery(idxSql);
  }

  console.log('SQLite database tables initialized successfully.');
}

async function initializeDatabase() {
  try {
    const rootPool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 5,
      connectTimeout: 2000
    });

    await rootPool.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10
    });

    console.log(`Connected to MySQL database: ${DB_NAME}`);
    mode = 'mysql';

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff') DEFAULT 'staff',
        phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_customer_email (email),
        INDEX idx_customer_phone (phone)
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id VARCHAR(50) UNIQUE NOT NULL,
        customer_id VARCHAR(50) NOT NULL,
        registration_number VARCHAR(50) UNIQUE NOT NULL,
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        vehicle_type ENUM('Car', 'Bike', 'SUV', 'Van', 'Truck') NOT NULL DEFAULT 'Car',
        fuel_type ENUM('Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG') NOT NULL DEFAULT 'Petrol',
        manufacturing_year INT,
        color VARCHAR(50),
        mileage INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_vehicle_customer (customer_id),
        INDEX idx_vehicle_reg (registration_number)
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS mechanics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mechanic_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        specialization ENUM('Engine', 'Electrical', 'Brakes', 'AC', 'Transmission', 'General Service') NOT NULL DEFAULT 'General Service',
        experience VARCHAR(50),
        joining_date DATE,
        availability BOOLEAN DEFAULT TRUE,
        status ENUM('Available', 'Busy', 'Inactive') DEFAULT 'Available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_mechanic_status (status)
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id VARCHAR(50) UNIQUE NOT NULL,
        customer_id VARCHAR(50) NOT NULL,
        vehicle_id VARCHAR(50) NOT NULL,
        mechanic_id VARCHAR(50),
        service_type VARCHAR(255) NOT NULL,
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        problem_description TEXT,
        estimated_cost DECIMAL(10, 2) DEFAULT 0.00,
        status ENUM('Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_booking_customer (customer_id),
        INDEX idx_booking_vehicle (vehicle_id),
        INDEX idx_booking_mechanic (mechanic_id),
        INDEX idx_booking_status (status)
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_id VARCHAR(50) UNIQUE NOT NULL,
        booking_id VARCHAR(50) NOT NULL,
        vehicle_id VARCHAR(50) NOT NULL,
        mechanic_id VARCHAR(50),
        service_type VARCHAR(255) NOT NULL,
        service_date DATE NOT NULL,
        parts_cost DECIMAL(10, 2) DEFAULT 0.00,
        labor_cost DECIMAL(10, 2) DEFAULT 0.00,
        total_cost DECIMAL(10, 2) DEFAULT 0.00,
        mechanic_notes TEXT,
        customer_feedback TEXT,
        status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_service_booking (booking_id),
        INDEX idx_service_vehicle (vehicle_id)
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        payment_id VARCHAR(50) UNIQUE NOT NULL,
        booking_id VARCHAR(50) NOT NULL,
        customer_id VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method ENUM('Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking') DEFAULT 'Cash',
        payment_date DATE NOT NULL,
        status ENUM('Paid', 'Pending', 'Failed', 'Refunded') DEFAULT 'Paid',
        transaction_reference VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_payment_booking (booking_id),
        INDEX idx_payment_customer (customer_id),
        INDEX idx_payment_status (status)
      ) ENGINE=InnoDB;
    `);

    console.log('MySQL Database tables initialized successfully.');
  } catch (error) {
    console.log('MySQL connection failed/unavailable. Switching to SQLite fallback engine...');
    mode = 'sqlite';
    await initSqliteDatabase();
  }
}

module.exports = {
  initializeDatabase,
  query: (sql, params) => {
    if (mode === 'mysql') {
      if (!pool) {
        throw new Error('Database pool not initialized. Call initializeDatabase first.');
      }
      return pool.query(sql, params);
    } else {
      if (!sqliteDb) {
        throw new Error('SQLite database not initialized. Call initializeDatabase first.');
      }
      return runSqliteQuery(sql, params);
    }
  },
  execute: (sql, params) => {
    if (mode === 'mysql') {
      if (!pool) {
        throw new Error('Database pool not initialized. Call initializeDatabase first.');
      }
      return pool.execute(sql, params);
    } else {
      if (!sqliteDb) {
        throw new Error('SQLite database not initialized. Call initializeDatabase first.');
      }
      return runSqliteQuery(sql, params);
    }
  }
};

