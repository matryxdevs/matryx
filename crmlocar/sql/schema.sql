-- Crmlocar 1.0 | MySQL 8+ / MariaDB 10.6+ | A base deve existir antes da inicialização.
-- Este script é aplicado automaticamente no primeiro npm start (CREATE TABLE IF NOT EXISTS).
CREATE TABLE IF NOT EXISTS companies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  legal_name VARCHAR(180) NOT NULL,
  trade_name VARCHAR(140) NOT NULL,
  cnpj VARCHAR(18) NULL,
  email VARCHAR(190) NULL,
  phone VARCHAR(30) NULL,
  city VARCHAR(120) NULL,
  state CHAR(2) NULL,
  address VARCHAR(240) NULL,
  plan ENUM('start','pro','enterprise') NOT NULL DEFAULT 'start',
  subscription_status ENUM('trial','active','past_due','suspended') NOT NULL DEFAULT 'trial',
  expires_at DATE NULL,
  status ENUM('active','suspended') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_company_cnpj (cnpj),
  INDEX idx_company_status (status,subscription_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  role ENUM('superadmin','company_admin','manager','operator','finance') NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  must_change_password TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_user_email (email),
  INDEX idx_user_tenant (company_id,role),
  CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash CHAR(64) PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  csrf_token CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session_expiry (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  plate VARCHAR(10) NOT NULL,
  brand VARCHAR(90) NOT NULL,
  model VARCHAR(120) NOT NULL,
  model_year SMALLINT UNSIGNED NULL,
  color VARCHAR(60) NULL,
  category VARCHAR(70) NULL,
  fuel_type VARCHAR(30) NULL,
  daily_rate DECIMAL(12,2) NOT NULL DEFAULT 0,
  odometer INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('available','rented','maintenance','inactive') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_vehicle_plate_tenant (company_id,plate),
  INDEX idx_vehicle_tenant_status (company_id,status),
  CONSTRAINT fk_vehicle_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  document VARCHAR(20) NULL,
  email VARCHAR(190) NULL,
  phone VARCHAR(30) NULL,
  driver_license VARCHAR(40) NULL,
  address VARCHAR(250) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer_tenant_name (company_id,full_name),
  CONSTRAINT fk_customer_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(190) NULL,
  source VARCHAR(80) NULL,
  interest VARCHAR(180) NULL,
  stage ENUM('new','contacted','proposal','negotiation','won','lost') NOT NULL DEFAULT 'new',
  estimated_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_lead_tenant_stage (company_id,stage),
  CONSTRAINT fk_lead_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rentals (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(40) NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  vehicle_id BIGINT UNSIGNED NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  actual_return_date DATE NULL,
  daily_rate DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  deposit_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  pickup_km INT UNSIGNED NULL,
  return_km INT UNSIGNED NULL,
  status ENUM('reserved','active','completed','cancelled') NOT NULL DEFAULT 'reserved',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rental_code_tenant (company_id,code),
  INDEX idx_rental_tenant_status (company_id,status,due_date),
  INDEX idx_rental_vehicle_dates (company_id,vehicle_id,start_date,due_date),
  CONSTRAINT fk_rental_company FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT fk_rental_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT fk_rental_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  rental_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method ENUM('pix','cash','card','transfer','other') NOT NULL DEFAULT 'pix',
  paid_at DATE NOT NULL,
  notes VARCHAR(300) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payment_tenant_date (company_id,paid_at),
  CONSTRAINT fk_payment_company FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT fk_payment_rental FOREIGN KEY (rental_id) REFERENCES rentals(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenances (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  vehicle_id BIGINT UNSIGNED NOT NULL,
  service_type VARCHAR(160) NOT NULL,
  supplier VARCHAR(150) NULL,
  cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  scheduled_date DATE NOT NULL,
  performed_date DATE NULL,
  status ENUM('scheduled','in_progress','completed') NOT NULL DEFAULT 'scheduled',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_maintenance_tenant_status (company_id,status,scheduled_date),
  CONSTRAINT fk_maintenance_company FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT fk_maintenance_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NULL,
  actor_user_id BIGINT UNSIGNED NULL,
  action VARCHAR(95) NOT NULL,
  entity_type VARCHAR(65) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  details JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_tenant_date (company_id,created_at),
  INDEX idx_audit_actor (actor_user_id),
  CONSTRAINT fk_audit_company FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT fk_audit_user FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
