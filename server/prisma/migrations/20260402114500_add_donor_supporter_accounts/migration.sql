ALTER TABLE `donors`
  ADD COLUMN `passwordHash` VARCHAR(255) NULL AFTER `preferredLanguage`,
  ADD COLUMN `accountStatus` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'INACTIVE' AFTER `passwordHash`,
  ADD COLUMN `supporterType` ENUM('SUPPORTER', 'DONOR') NOT NULL DEFAULT 'SUPPORTER' AFTER `accountStatus`,
  ADD COLUMN `sourceEventId` INTEGER NULL AFTER `supporterType`,
  ADD COLUMN `lastLoginAt` DATETIME(3) NULL AFTER `sourceEventId`;

CREATE INDEX `donors_accountStatus_supporterType_idx`
  ON `donors`(`accountStatus`, `supporterType`);

CREATE INDEX `donors_sourceEventId_idx`
  ON `donors`(`sourceEventId`);

ALTER TABLE `donors`
  ADD CONSTRAINT `donors_sourceEventId_fkey`
  FOREIGN KEY (`sourceEventId`) REFERENCES `events`(`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;
