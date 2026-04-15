UPDATE employees
SET employee_code = 'EMP-ADMIN-001',
    name = 'System Admin',
    email = 'admin@example.org',
    password_hash = '$2a$10$VnXNzApwki1JVzLwy0rDreK.Xs90OUq6qPIWYtiq8B7R490S.ZF0.',
    role = 'ADMIN',
    status = 'ACTIVE',
    position = 'Administrator',
    hometown = 'Shanghai',
    schedule = 'Mon-Fri'
WHERE id = 1;

UPDATE employees
SET employee_code = 'EMP-OPS-001',
    name = 'Amy Wu',
    email = 'operations@example.org',
    password_hash = '$2a$10$5fJPJg4m4tkhRHRYmkCMnOeNbT68JkeH3ofNfg.xQzjO3J8c4ClyK',
    role = 'OPERATIONS',
    status = 'ACTIVE',
    position = 'Campaign Coordinator',
    hometown = 'Suzhou',
    schedule = 'Tue-Sat'
WHERE id = 2;

UPDATE employees
SET employee_code = 'EMP-EVT-001',
    name = 'Kevin Fang',
    email = 'kevin.fang@example.org',
    password_hash = '$2a$10$5fJPJg4m4tkhRHRYmkCMnOeNbT68JkeH3ofNfg.xQzjO3J8c4ClyK',
    role = 'EVENT',
    status = 'ACTIVE',
    position = 'Event Lead',
    hometown = 'Hangzhou',
    schedule = 'Wed-Sun'
WHERE id = 3;

UPDATE donors
SET donor_code = 'DON-DEMO-001',
    first_name = 'Demo',
    last_name = 'Donor',
    email = 'demo.donor@example.org',
    password_hash = '$2a$10$hlRmkIMuXguk0hXAIspZU.gV89cNx2G35q5RZLkzxC/7gj6eEA5TO',
    account_status = 'ACTIVE',
    supporter_type = 'DONOR'
WHERE id = 1;

UPDATE donation_receivables
SET donation_code = 'DR-DEMO-001'
WHERE id = 1;

UPDATE donation_receivables
SET donation_code = 'DR-DEMO-002'
WHERE id = 2;

UPDATE donation_receivables
SET donation_code = 'DR-DEMO-003'
WHERE id = 3;
