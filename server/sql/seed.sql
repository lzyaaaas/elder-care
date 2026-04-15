INSERT INTO employees (
  id, employee_code, name, gender, birthday, contact, schedule, hometown, position, email, password_hash, role, status
) VALUES
  (1, 'EMP-ADMIN-001', 'System Admin', 'FEMALE', '1990-04-15', '+86-13800000001', 'Mon-Fri', 'Shanghai', 'Administrator', 'admin@example.org', '$2a$10$VnXNzApwki1JVzLwy0rDreK.Xs90OUq6qPIWYtiq8B7R490S.ZF0.', 'ADMIN', 'ACTIVE'),
  (2, 'EMP-OPS-001', 'Amy Wu', 'FEMALE', '1997-09-21', '+86-13800000002', 'Tue-Sat', 'Suzhou', 'Campaign Coordinator', 'operations@example.org', '$2a$10$5fJPJg4m4tkhRHRYmkCMnOeNbT68JkeH3ofNfg.xQzjO3J8c4ClyK', 'OPERATIONS', 'ACTIVE'),
  (3, 'EMP-EVT-001', 'Kevin Fang', 'MALE', '1999-01-09', '+86-13800000003', 'Wed-Sun', 'Hangzhou', 'Event Lead', 'kevin.fang@example.org', '$2a$10$5fJPJg4m4tkhRHRYmkCMnOeNbT68JkeH3ofNfg.xQzjO3J8c4ClyK', 'EVENT', 'ACTIVE');

INSERT INTO donation_kits (
  id, kit_code, kit_name, description, is_active
) VALUES
  (1, 'KIT-STARTER', 'Starter Story Kit', 'One storybook, one envelope, one gift box.', 1),
  (2, 'KIT-FAMILY', 'Family Story Kit', 'Two books with upgraded packaging.', 1);

INSERT INTO presses (
  id, press_name, description, contact_person, phone_number, email
) VALUES
  (1, 'Bright Seed Press', 'Children storybook publishing partner.', 'Helen Guo', '+86-021-55550001', 'contact@brightseedpress.cn');

INSERT INTO book_series (
  id, series_name, description
) VALUES
  (1, 'Creators Story Collection', 'A warm story series for family reading.');

INSERT INTO book_formats (
  id, format_type, language, file_size_mb, is_available
) VALUES
  (1, 'HARDCOVER', 'zh-CN', NULL, 1),
  (2, 'PDF', 'en', 18.50, 1);

INSERT INTO books (
  id, press_id, book_series_id, title, book_format_id, description, page_count, unit_cost, current_stock, reorder_level, publication_date
) VALUES
  (1, 1, 1, 'Chaofeng and Maui in Making Friends', 1, 'Main donor gift book for the campaign.', 48, 18.00, 240, 50, '2025-10-01'),
  (2, 1, 1, 'Chaofeng and Maui in Making Friends', 2, 'English digital companion edition.', 48, 6.00, 999, 0, '2025-10-01');

INSERT INTO envelopes (
  id, envelope_code, size, unit_cost, current_stock, reorder_level, description, last_restock_date, is_active
) VALUES
  (1, 'ENV-A5-WHT', 'A5', 1.20, 500, 100, 'White campaign thank-you envelope.', '2026-03-15', 1);

INSERT INTO boxes (
  id, box_code, size, unit_cost, current_stock, reorder_level, description, last_restock_date, is_active
) VALUES
  (1, 'BOX-S-GOLD', 'Small', 4.50, 180, 40, 'Gold gift box for donor kit packaging.', '2026-03-18', 1);

INSERT INTO kit_components (
  id, description, donation_kit_id, component_type, quantity, book_id, box_id, envelope_id
) VALUES
  (1, 'Main storybook copy', 1, 'BOOK', 1, 1, NULL, NULL),
  (2, 'Thank-you envelope', 1, 'ENVELOPE', 1, NULL, NULL, 1),
  (3, 'Gift presentation box', 1, 'BOX', 1, NULL, 1, NULL),
  (4, 'Main storybook copies', 2, 'BOOK', 2, 1, NULL, NULL),
  (5, 'Gift presentation box', 2, 'BOX', 1, NULL, 1, NULL);

INSERT INTO events (
  id, event_name, description, type, start_date, end_date, country, state, city, employee_id, is_active
) VALUES
  (1, 'Spring Storytelling Fundraiser', 'Launch event for the storybook donation campaign.', 'FUNDRAISER', '2026-04-12 10:00:00', '2026-04-12 16:00:00', 'China', 'Shanghai', 'Shanghai', 3, 1),
  (2, 'School Reading Outreach', 'Volunteer reading day with promotional giveaway.', 'SCHOOL_VISIT', '2026-04-25 09:00:00', '2026-04-25 12:00:00', 'China', 'Jiangsu', 'Suzhou', 3, 1);

INSERT INTO donors (
  id, donor_code, first_name, last_name, birthday, gender, country, state, city, street_address, postal_code, email, phone, preferred_language, password_hash, account_status, supporter_type, source_event_id, last_login_at, registration_date
) VALUES
  (1, 'DON-DEMO-001', 'Demo', 'Donor', '1994-06-01', 'FEMALE', 'China', 'Shanghai', 'Shanghai', '88 Nanjing Rd', '200001', 'demo.donor@example.org', '+86-13900000001', 'zh-CN', '$2a$10$hlRmkIMuXguk0hXAIspZU.gV89cNx2G35q5RZLkzxC/7gj6eEA5TO', 'ACTIVE', 'DONOR', 1, '2026-04-02 10:00:00', '2026-01-05'),
  (2, 'DON-002', 'Jason', 'Wang', '1989-03-12', 'MALE', 'China', 'Beijing', 'Beijing', '16 East Ave', '100000', 'jason.wang@example.com', '+86-13900000002', 'en', NULL, 'INACTIVE', 'DONOR', 1, NULL, '2026-01-10'),
  (3, 'DON-003', 'Sara', 'Liu', '1996-11-08', 'FEMALE', 'China', 'Guangdong', 'Shenzhen', '205 Bay St', '518000', 'sara.liu@example.com', '+86-13900000003', 'zh-CN', NULL, 'INACTIVE', 'SUPPORTER', 2, NULL, '2026-02-02');

INSERT INTO schedules (
  id, employee_id, event_id, shift_date, start_time, end_time, status, notes
) VALUES
  (1, 3, 1, '2026-04-12', '09:00', '13:00', 'SCHEDULED', 'Front-of-house donor welcome and check-in coverage.'),
  (2, 3, NULL, '2026-04-05', '13:30', '17:30', 'SCHEDULED', 'Inventory prep and donor kit assembly block.'),
  (3, 3, NULL, '2026-03-30', '10:00', '14:00', 'COMPLETED', 'Completed postcard packing and outbound coordination.'),
  (4, 1, 1, '2026-04-12', '08:00', '12:00', 'SCHEDULED', 'Campaign oversight and volunteer briefing.');

INSERT INTO promotion_assets (
  id, asset_code, asset_category, asset_name, description, asset_type, is_active
) VALUES
  (1, 'AST-FLYER-001', 'PRINT', 'Campaign Flyer', 'One-page campaign introduction flyer.', 'FLYER', 1),
  (2, 'AST-BMK-001', 'MERCHANDISE', 'Story Bookmark', 'Bookmark given during events.', 'BOOKMARK', 1);

INSERT INTO promotion_inventory (
  id, inventory_code, promotion_inventory_type, size, unit_cost, current_stock, reorder_level, description, last_restock_date, is_active
) VALUES
  (1, 'PINV-FLYER-A4', 'Flyer', 'A4', 0.60, 1200, 200, 'A4 printed flyers for community events.', '2026-03-20', 1),
  (2, 'PINV-BMK-STD', 'Bookmark', 'Standard', 0.80, 800, 150, 'Printed bookmark gift item.', '2026-03-22', 1);

INSERT INTO donation_receivables (
  id, donation_code, donor_id, event_id, donation_amount, donation_date, donation_frequency, status, donation_kit_id, employee_id, notes
) VALUES
  (1, 'DR-DEMO-001', 1, 1, 200.00, '2026-03-28', 'ONE_TIME', 'COMPLETED', 1, 1, 'Early supporter from launch mailing list.'),
  (2, 'DR-DEMO-002', 2, 1, 500.00, '2026-03-29', 'MONTHLY', 'SHIPPED', 2, 1, 'Corporate matching donation pending final docs.'),
  (3, 'DR-DEMO-003', 3, 2, 120.00, '2026-03-30', 'ONE_TIME', 'CONFIRMED', 1, 1, 'Requested simplified receipt language.');

INSERT INTO donation_receipts (
  id, receipt_number, donation_id, amount, receipt_date, payment_method, transaction_id, status, notes
) VALUES
  (1, 'RCPT-2026-001', 1, 200.00, '2026-03-28', 'BANK_TRANSFER', 'TXN-BT-20260328-001', 'ISSUED', 'Bank transfer confirmed.'),
  (2, 'RCPT-2026-002', 2, 500.00, '2026-03-29', 'CARD', 'TXN-CD-20260329-002', 'ISSUED', 'Processed at fundraiser booth.');

INSERT INTO shippings (
  id, donation_id, tracking_number, carrier, shipped_date, delivery_date, shipping_cost, status
) VALUES
  (1, 1, 'SF123456789CN', 'SF Express', '2026-03-29', '2026-03-31', 18.00, 'DELIVERED'),
  (2, 2, 'YTO987654321CN', 'YTO', '2026-03-31', NULL, 22.00, 'SHIPPED');

INSERT INTO feedback (
  id, donation_id, feedback_content, rating, feedback_date, response_content, response_date, status
) VALUES
  (1, 1, 'The gift kit arrived beautifully packaged and the book is lovely.', 5, '2026-04-01', 'Thank you for supporting the campaign.', '2026-04-01', 'RESPONDED');

INSERT INTO event_promotions (
  id, event_id, promotion_asset_id, promotion_asset_quantity
) VALUES
  (1, 1, 1, 300),
  (2, 1, 2, 150),
  (3, 2, 2, 200);

INSERT INTO promotion_gift_assignments (
  id, event_id, promotion_inventory_id, gift_quantity, gift_date, status
) VALUES
  (1, 1, 2, 120, '2026-04-12', 'PLANNED'),
  (2, 2, 2, 80, '2026-04-25', 'PLANNED');

INSERT INTO vendors (
  id, vendor_code, name, contact_person, phone_number, address, email, rating, supply_type, last_supply_date, is_active
) VALUES
  (1, 'VEN-PRINT-001', 'Sunrise Print Supply', 'Eric Zhou', '+86-021-66660001', '28 Print Park, Shanghai', 'sales@sunriseprint.cn', 5, 'Printing', '2026-03-20', 1),
  (2, 'VEN-PACK-001', 'Golden Pack Co.', 'Nina Xu', '+86-021-66660002', '16 Packing Rd, Shanghai', 'hello@goldenpack.cn', 4, 'Packaging', '2026-03-18', 1);

INSERT INTO invoices (
  id, invoice_number, employee_id, invoice_date, due_date, vendor_id, status, notes, subtotal, tax_amount, total_amount
) VALUES
  (1, 'INV-2026-001', 2, '2026-03-20', '2026-04-20', 1, 'APPROVED', 'Flyer printing batch for April events.', 720.00, 43.20, 763.20),
  (2, 'INV-2026-002', 2, '2026-03-18', '2026-04-18', 2, 'PARTIALLY_PAID', 'Gift box replenishment order.', 810.00, 48.60, 858.60);

INSERT INTO invoice_items (
  id, invoice_id, envelope_id, box_id, promotion_inventory_id, description, quantity, unit_price, amount
) VALUES
  (1, 1, NULL, NULL, 1, 'A4 campaign flyer printing', 1200, 0.60, 720.00),
  (2, 2, NULL, 1, NULL, 'Small gift box restock', 180, 4.50, 810.00);

INSERT INTO payables (
  id, invoice_id, remaining_amount, due_date, payment_terms, notes, status
) VALUES
  (1, 1, 763.20, '2026-04-20', 'Net 30', 'Awaiting April payment run.', 'OPEN'),
  (2, 2, 358.60, '2026-04-18', 'Net 30', 'Partial payment already processed.', 'PARTIALLY_PAID');

INSERT INTO invoice_payments (
  id, payable_id, amount, payment_date, payment_method, reference_number, notes
) VALUES
  (1, 2, 500.00, '2026-03-28', 'BANK_TRANSFER', 'PAY-2026-001', 'Deposit paid to packaging vendor.');
