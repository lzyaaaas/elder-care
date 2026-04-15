CREATE DATABASE IF NOT EXISTS nonprofit_storytelling_campaign
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nonprofit_storytelling_campaign;

CREATE TABLE donors (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  donor_code VARCHAR(30) NOT NULL UNIQUE,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  birthday DATE NULL,
  gender ENUM('FEMALE', 'MALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY') NULL,
  country VARCHAR(80) NOT NULL,
  state VARCHAR(80) NULL,
  city VARCHAR(80) NULL,
  street_address VARCHAR(255) NULL,
  postal_code VARCHAR(20) NULL,
  email VARCHAR(120) NULL UNIQUE,
  phone VARCHAR(30) NULL,
  preferred_language VARCHAR(30) NULL,
  password_hash VARCHAR(255) NULL,
  account_status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'INACTIVE',
  supporter_type ENUM('SUPPORTER', 'DONOR') NOT NULL DEFAULT 'SUPPORTER',
  source_event_id INT UNSIGNED NULL,
  last_login_at DATETIME NULL,
  registration_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_donor_name (last_name, first_name),
  INDEX idx_donor_registration_date (registration_date),
  INDEX idx_donor_account_status_type (account_status, supporter_type),
  INDEX idx_donor_source_event_id (source_event_id)
);

CREATE TABLE employees (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  gender ENUM('FEMALE', 'MALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY') NULL,
  birthday DATE NULL,
  contact VARCHAR(120) NULL,
  schedule VARCHAR(120) NULL,
  hometown VARCHAR(120) NULL,
  position VARCHAR(100) NULL,
  email VARCHAR(120) NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  role ENUM('ADMIN', 'OPERATIONS', 'FINANCE', 'EVENT', 'VOLUNTEER') NOT NULL DEFAULT 'OPERATIONS',
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee_status_role (status, role)
);

CREATE TABLE donation_kits (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kit_code VARCHAR(30) NOT NULL UNIQUE,
  kit_name VARCHAR(120) NOT NULL,
  description VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_donation_kit_active (is_active)
);

CREATE TABLE presses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  press_name VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  contact_person VARCHAR(120) NULL,
  phone_number VARCHAR(30) NULL,
  email VARCHAR(120) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE book_series (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  series_name VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE book_formats (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  format_type VARCHAR(50) NOT NULL,
  language VARCHAR(30) NOT NULL,
  file_size_mb DECIMAL(8, 2) NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_book_format_type_language (format_type, language),
  INDEX idx_book_format_available (is_available)
);

CREATE TABLE books (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  press_id INT UNSIGNED NOT NULL,
  book_series_id INT UNSIGNED NULL,
  title VARCHAR(180) NOT NULL,
  book_format_id INT UNSIGNED NOT NULL,
  description VARCHAR(500) NULL,
  page_count INT UNSIGNED NULL,
  unit_cost DECIMAL(10, 2) NOT NULL,
  current_stock INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 0,
  publication_date DATE NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_book_stock CHECK (current_stock >= 0),
  CONSTRAINT chk_book_reorder_level CHECK (reorder_level >= 0),
  CONSTRAINT fk_books_press FOREIGN KEY (press_id) REFERENCES presses(id),
  CONSTRAINT fk_books_series FOREIGN KEY (book_series_id) REFERENCES book_series(id) ON DELETE SET NULL,
  CONSTRAINT fk_books_format FOREIGN KEY (book_format_id) REFERENCES book_formats(id),
  INDEX idx_books_press_id (press_id),
  INDEX idx_books_series_id (book_series_id),
  INDEX idx_books_format_id (book_format_id),
  INDEX idx_books_title (title),
  INDEX idx_books_stock (current_stock, reorder_level)
);

CREATE TABLE envelopes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  envelope_code VARCHAR(30) NOT NULL UNIQUE,
  size VARCHAR(50) NOT NULL,
  unit_cost DECIMAL(10, 2) NOT NULL,
  current_stock INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 0,
  description VARCHAR(255) NULL,
  last_restock_date DATE NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_envelope_stock CHECK (current_stock >= 0),
  CONSTRAINT chk_envelope_reorder CHECK (reorder_level >= 0),
  INDEX idx_envelopes_active (is_active),
  INDEX idx_envelopes_stock (current_stock, reorder_level)
);

CREATE TABLE boxes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  box_code VARCHAR(30) NOT NULL UNIQUE,
  size VARCHAR(50) NOT NULL,
  unit_cost DECIMAL(10, 2) NOT NULL,
  current_stock INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 0,
  description VARCHAR(255) NULL,
  last_restock_date DATE NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_box_stock CHECK (current_stock >= 0),
  CONSTRAINT chk_box_reorder CHECK (reorder_level >= 0),
  INDEX idx_boxes_active (is_active),
  INDEX idx_boxes_stock (current_stock, reorder_level)
);

CREATE TABLE kit_components (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(255) NULL,
  donation_kit_id INT UNSIGNED NOT NULL,
  component_type ENUM('BOOK', 'ENVELOPE', 'BOX') NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  book_id INT UNSIGNED NULL,
  box_id INT UNSIGNED NULL,
  envelope_id INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_kit_component_quantity CHECK (quantity > 0),
  CONSTRAINT fk_kit_components_kit FOREIGN KEY (donation_kit_id) REFERENCES donation_kits(id) ON DELETE CASCADE,
  CONSTRAINT fk_kit_components_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL,
  CONSTRAINT fk_kit_components_box FOREIGN KEY (box_id) REFERENCES boxes(id) ON DELETE SET NULL,
  CONSTRAINT fk_kit_components_envelope FOREIGN KEY (envelope_id) REFERENCES envelopes(id) ON DELETE SET NULL,
  INDEX idx_kit_components_kit_id (donation_kit_id),
  INDEX idx_kit_components_book_id (book_id),
  INDEX idx_kit_components_box_id (box_id),
  INDEX idx_kit_components_envelope_id (envelope_id)
);

CREATE TABLE events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_name VARCHAR(160) NOT NULL,
  description VARCHAR(500) NULL,
  type ENUM('FUNDRAISER', 'SCHOOL_VISIT', 'COMMUNITY_OUTREACH', 'ONLINE_CAMPAIGN', 'BOOK_LAUNCH', 'OTHER') NOT NULL DEFAULT 'OTHER',
  start_date DATETIME NOT NULL,
  end_date DATETIME NULL,
  country VARCHAR(80) NOT NULL,
  state VARCHAR(80) NULL,
  city VARCHAR(80) NULL,
  employee_id INT UNSIGNED NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  INDEX idx_events_employee_id (employee_id),
  INDEX idx_events_dates (start_date, end_date),
  INDEX idx_events_active_type (is_active, type)
);

ALTER TABLE donors
  ADD CONSTRAINT fk_donors_source_event
  FOREIGN KEY (source_event_id) REFERENCES events(id) ON DELETE SET NULL;

CREATE TABLE schedules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id INT UNSIGNED NOT NULL,
  event_id INT UNSIGNED NULL,
  shift_date DATE NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
  notes VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_schedules_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_schedules_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
  INDEX idx_schedules_employee_id (employee_id),
  INDEX idx_schedules_event_id (event_id),
  INDEX idx_schedules_shift_status (shift_date, status)
);

CREATE TABLE promotion_assets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  asset_code VARCHAR(30) NOT NULL UNIQUE,
  asset_category ENUM('PRINT', 'DIGITAL', 'MERCHANDISE', 'DISPLAY', 'OTHER') NOT NULL DEFAULT 'OTHER',
  asset_name VARCHAR(160) NOT NULL,
  description VARCHAR(255) NULL,
  asset_type ENUM('FLYER', 'POSTER', 'BANNER', 'BOOKMARK', 'STICKER', 'GIFT', 'OTHER') NOT NULL DEFAULT 'OTHER',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_promotion_assets_lookup (is_active, asset_category, asset_type)
);

CREATE TABLE promotion_inventory (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  inventory_code VARCHAR(30) NOT NULL UNIQUE,
  promotion_inventory_type VARCHAR(80) NOT NULL,
  size VARCHAR(50) NULL,
  unit_cost DECIMAL(10, 2) NOT NULL,
  current_stock INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 0,
  description VARCHAR(255) NULL,
  last_restock_date DATE NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_promotion_inventory_stock CHECK (current_stock >= 0),
  CONSTRAINT chk_promotion_inventory_reorder CHECK (reorder_level >= 0),
  INDEX idx_promotion_inventory_active (is_active),
  INDEX idx_promotion_inventory_stock (current_stock, reorder_level)
);

CREATE TABLE donation_receivables (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  donation_code VARCHAR(30) NOT NULL UNIQUE,
  donor_id INT UNSIGNED NOT NULL,
  event_id INT UNSIGNED NULL,
  donation_amount DECIMAL(10, 2) NOT NULL,
  donation_date DATE NOT NULL,
  donation_frequency ENUM('ONE_TIME', 'MONTHLY') NOT NULL DEFAULT 'ONE_TIME',
  status ENUM('PENDING', 'CONFIRMED', 'RECEIPTED', 'SHIPPED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  donation_kit_id INT UNSIGNED NULL,
  employee_id INT UNSIGNED NULL,
  notes VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_donation_receivable_amount CHECK (donation_amount >= 0),
  CONSTRAINT fk_donation_receivables_donor FOREIGN KEY (donor_id) REFERENCES donors(id),
  CONSTRAINT fk_donation_receivables_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
  CONSTRAINT fk_donation_receivables_kit FOREIGN KEY (donation_kit_id) REFERENCES donation_kits(id) ON DELETE SET NULL,
  CONSTRAINT fk_donation_receivables_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  INDEX idx_donation_receivables_donor_id (donor_id),
  INDEX idx_donation_receivables_event_id (event_id),
  INDEX idx_donation_receivables_kit_id (donation_kit_id),
  INDEX idx_donation_receivables_employee_id (employee_id),
  INDEX idx_donation_receivables_frequency (donation_frequency),
  INDEX idx_donation_receivables_date_status (donation_date, status)
);

CREATE TABLE donation_receipts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  receipt_number VARCHAR(30) NOT NULL UNIQUE,
  donation_id INT UNSIGNED NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  receipt_date DATE NOT NULL,
  payment_method ENUM('CASH', 'CARD', 'BANK_TRANSFER', 'CHECK', 'OTHER') NOT NULL,
  transaction_id VARCHAR(80) NULL,
  status ENUM('ISSUED', 'VOID') NOT NULL DEFAULT 'ISSUED',
  notes VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_donation_receipt_amount CHECK (amount >= 0),
  CONSTRAINT fk_donation_receipts_donation FOREIGN KEY (donation_id) REFERENCES donation_receivables(id) ON DELETE CASCADE,
  INDEX idx_donation_receipts_donation_id (donation_id),
  INDEX idx_donation_receipts_receipt_date (receipt_date)
);

CREATE TABLE shippings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  donation_id INT UNSIGNED NOT NULL,
  tracking_number VARCHAR(80) NULL UNIQUE,
  carrier VARCHAR(80) NULL,
  shipped_date DATE NULL,
  delivery_date DATE NULL,
  shipping_cost DECIMAL(10, 2) NULL,
  status ENUM('PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'RETURNED', 'LOST') NOT NULL DEFAULT 'PENDING',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_shipping_cost CHECK (shipping_cost IS NULL OR shipping_cost >= 0),
  CONSTRAINT fk_shippings_donation FOREIGN KEY (donation_id) REFERENCES donation_receivables(id) ON DELETE CASCADE,
  INDEX idx_shippings_donation_id (donation_id),
  INDEX idx_shippings_status_shipped_date (status, shipped_date)
);

CREATE TABLE feedback (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  donation_id INT UNSIGNED NOT NULL,
  feedback_content VARCHAR(1000) NOT NULL,
  rating INT NULL,
  feedback_date DATE NOT NULL,
  response_content VARCHAR(1000) NULL,
  response_date DATE NULL,
  status ENUM('NEW', 'REVIEWED', 'RESPONDED', 'CLOSED') NOT NULL DEFAULT 'NEW',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_feedback_rating CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  CONSTRAINT fk_feedback_donation FOREIGN KEY (donation_id) REFERENCES donation_receivables(id) ON DELETE CASCADE,
  INDEX idx_feedback_donation_id (donation_id),
  INDEX idx_feedback_status_date (status, feedback_date)
);

CREATE TABLE event_promotions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  promotion_asset_id INT UNSIGNED NOT NULL,
  promotion_asset_quantity INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_event_promotion_qty CHECK (promotion_asset_quantity > 0),
  CONSTRAINT fk_event_promotions_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_event_promotions_asset FOREIGN KEY (promotion_asset_id) REFERENCES promotion_assets(id),
  UNIQUE KEY uq_event_promotions_event_asset (event_id, promotion_asset_id),
  INDEX idx_event_promotions_asset_id (promotion_asset_id)
);

CREATE TABLE promotion_gift_assignments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  promotion_inventory_id INT UNSIGNED NOT NULL,
  gift_quantity INT NOT NULL DEFAULT 1,
  gift_date DATE NOT NULL,
  status ENUM('PLANNED', 'ASSIGNED', 'DISTRIBUTED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_promotion_gift_assignment_qty CHECK (gift_quantity > 0),
  CONSTRAINT fk_promotion_gift_assignments_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_promotion_gift_assignments_inventory FOREIGN KEY (promotion_inventory_id) REFERENCES promotion_inventory(id),
  INDEX idx_promotion_gift_assignments_event_id (event_id),
  INDEX idx_promotion_gift_assignments_inventory_id (promotion_inventory_id),
  INDEX idx_promotion_gift_assignments_date_status (gift_date, status)
);

CREATE TABLE vendors (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vendor_code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  contact_person VARCHAR(120) NULL,
  phone_number VARCHAR(30) NULL,
  address VARCHAR(255) NULL,
  email VARCHAR(120) NULL,
  rating INT NULL,
  supply_type VARCHAR(100) NULL,
  last_supply_date DATE NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_vendor_rating CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  INDEX idx_vendors_active_supply_type (is_active, supply_type)
);

CREATE TABLE invoices (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(30) NOT NULL UNIQUE,
  employee_id INT UNSIGNED NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  vendor_id INT UNSIGNED NOT NULL,
  status ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
  notes VARCHAR(500) NULL,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_invoices_subtotal CHECK (subtotal >= 0),
  CONSTRAINT chk_invoices_tax_amount CHECK (tax_amount >= 0),
  CONSTRAINT chk_invoices_total_amount CHECK (total_amount >= 0),
  CONSTRAINT fk_invoices_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  CONSTRAINT fk_invoices_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  INDEX idx_invoices_employee_id (employee_id),
  INDEX idx_invoices_vendor_id (vendor_id),
  INDEX idx_invoices_date_due_status (invoice_date, due_date, status)
);

CREATE TABLE invoice_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT UNSIGNED NOT NULL,
  envelope_id INT UNSIGNED NULL,
  box_id INT UNSIGNED NULL,
  promotion_inventory_id INT UNSIGNED NULL,
  description VARCHAR(255) NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_invoice_item_quantity CHECK (quantity > 0),
  CONSTRAINT chk_invoice_item_unit_price CHECK (unit_price >= 0),
  CONSTRAINT chk_invoice_item_amount CHECK (amount >= 0),
  CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  CONSTRAINT fk_invoice_items_envelope FOREIGN KEY (envelope_id) REFERENCES envelopes(id) ON DELETE SET NULL,
  CONSTRAINT fk_invoice_items_box FOREIGN KEY (box_id) REFERENCES boxes(id) ON DELETE SET NULL,
  CONSTRAINT fk_invoice_items_promotion_inventory FOREIGN KEY (promotion_inventory_id) REFERENCES promotion_inventory(id) ON DELETE SET NULL,
  INDEX idx_invoice_items_invoice_id (invoice_id),
  INDEX idx_invoice_items_envelope_id (envelope_id),
  INDEX idx_invoice_items_box_id (box_id),
  INDEX idx_invoice_items_promotion_inventory_id (promotion_inventory_id)
);

CREATE TABLE payables (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT UNSIGNED NOT NULL UNIQUE,
  remaining_amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  payment_terms VARCHAR(120) NULL,
  notes VARCHAR(255) NULL,
  status ENUM('OPEN', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_payables_remaining_amount CHECK (remaining_amount >= 0),
  CONSTRAINT fk_payables_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  INDEX idx_payables_due_date_status (due_date, status)
);

CREATE TABLE invoice_payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payable_id INT UNSIGNED NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method ENUM('CASH', 'CARD', 'BANK_TRANSFER', 'CHECK', 'OTHER') NOT NULL,
  reference_number VARCHAR(80) NULL,
  notes VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_invoice_payment_amount CHECK (amount > 0),
  CONSTRAINT fk_invoice_payments_payable FOREIGN KEY (payable_id) REFERENCES payables(id) ON DELETE CASCADE,
  INDEX idx_invoice_payments_payable_id (payable_id),
  INDEX idx_invoice_payments_payment_date (payment_date)
);
