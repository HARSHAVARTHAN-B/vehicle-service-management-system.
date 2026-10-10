-- AutoCare Pro Database Schema
CREATE DATABASE IF NOT EXISTS `autocare_db`;
USE `autocare_db`;

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') DEFAULT 'staff',
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- CUSTOMERS TABLE
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

-- VEHICLES TABLE
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

-- MECHANICS TABLE
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

-- BOOKINGS TABLE
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

-- SERVICE RECORDS TABLE
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

-- PAYMENTS TABLE
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
