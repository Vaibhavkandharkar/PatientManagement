-- ============================================================
--  MediCore HMS — MySQL Database Schema
--  Run this file once to create all tables
-- ============================================================

CREATE DATABASE IF NOT EXISTS medicore_hms;
USE medicore_hms;

-- ─────────────────────────────────────────
--  1. USERS  (admin / doctor login)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  role         ENUM('admin','doctor','staff') DEFAULT 'staff',
  is_active    TINYINT(1) DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  2. DOCTORS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id        VARCHAR(10) NOT NULL UNIQUE,   -- e.g. D001
  name             VARCHAR(100) NOT NULL,
  specialization   VARCHAR(100),
  contact          VARCHAR(20),
  available_days   VARCHAR(100),
  joining_date     DATE,
  total_patients   INT DEFAULT 0,
  is_active        TINYINT(1) DEFAULT 1,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  3. PATIENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  patient_id     VARCHAR(10) NOT NULL UNIQUE,     -- e.g. P001
  name           VARCHAR(100) NOT NULL,
  age            INT,
  blood_group    VARCHAR(5),
  contact        VARCHAR(20),
  disease        VARCHAR(150),
  address        TEXT,
  admission_date DATE,
  next_visit     DATE,
  doctor_id      INT,
  status         ENUM('Admitted','Discharged','Under Observation','Emergency') DEFAULT 'Admitted',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────
--  4. STAFF
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  staff_id     VARCHAR(10) NOT NULL UNIQUE,       -- e.g. S001
  name         VARCHAR(100) NOT NULL,
  role         VARCHAR(80),
  department   VARCHAR(80),
  contact      VARCHAR(20),
  shift        VARCHAR(50),
  salary       DECIMAL(10,2),
  joining_date DATE,
  status       ENUM('On Duty','Off Duty','On Leave') DEFAULT 'On Duty',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  5. APPOINTMENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id   VARCHAR(10) NOT NULL UNIQUE,   -- e.g. A001
  patient_id       INT,
  doctor_id        INT,
  patient_name     VARCHAR(100),                  -- denormalized for quick display
  doctor_name      VARCHAR(100),
  department       VARCHAR(80),
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  notes            TEXT,
  status           ENUM('Confirmed','Rescheduled','Cancelled','Completed') DEFAULT 'Confirmed',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
  FOREIGN KEY (doctor_id)  REFERENCES doctors(id)  ON DELETE SET NULL
);

-- ─────────────────────────────────────────
--  6. PRESCRIPTIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescriptions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  patient_id   INT NOT NULL,
  doctor_id    INT,
  disease      VARCHAR(150),
  notes        TEXT,
  prescribed_on DATE DEFAULT (CURDATE()),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id)  REFERENCES doctors(id)  ON DELETE SET NULL
);

-- ─────────────────────────────────────────
--  7. PRESCRIPTION MEDICINES  (line items)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescription_medicines (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  prescription_id INT NOT NULL,
  medicine_name   VARCHAR(100) NOT NULL,
  morning         TINYINT(1) DEFAULT 0,
  afternoon       TINYINT(1) DEFAULT 0,
  night           TINYINT(1) DEFAULT 0,
  timing          ENUM('Before Food','After Food') DEFAULT 'After Food',
  duration_days   INT,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
--  8. INVOICES  (billing header)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  invoice_no   VARCHAR(20) NOT NULL UNIQUE,       -- e.g. INV-1711234567
  patient_id   INT,
  patient_name VARCHAR(100),
  contact      VARCHAR(20),
  grand_total  DECIMAL(10,2) DEFAULT 0,
  status       ENUM('Pending','Paid','Cancelled') DEFAULT 'Pending',
  invoice_date DATE DEFAULT (CURDATE()),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────
--  9. INVOICE ITEMS  (services & medicines)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id   INT NOT NULL,
  item_type    ENUM('service','medicine') NOT NULL,
  item_name    VARCHAR(150) NOT NULL,
  quantity     INT DEFAULT 1,
  unit_price   DECIMAL(10,2) NOT NULL,
  total_price  DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
--  SEED: default admin user  (password: admin123)
-- ─────────────────────────────────────────
INSERT IGNORE INTO users (name, email, password, role)
VALUES ('Admin User', 'admin@medicore.in',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lF/i', -- bcrypt of 'admin123'
        'admin');
