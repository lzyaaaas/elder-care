ALTER TABLE `donation_receivables`
  ADD COLUMN `donationFrequency` ENUM('ONE_TIME', 'MONTHLY') NOT NULL DEFAULT 'ONE_TIME' AFTER `donationDate`;

CREATE INDEX `idx_donation_receivables_frequency`
  ON `donation_receivables`(`donationFrequency`);
