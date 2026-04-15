ALTER TABLE `donors`
  ADD COLUMN `maritalStatus` ENUM('SINGLE', 'MARRIED', 'PREFER_NOT_TO_SAY') NULL AFTER `gender`;

ALTER TABLE `employees`
  ADD COLUMN `maritalStatus` ENUM('SINGLE', 'MARRIED', 'PREFER_NOT_TO_SAY') NULL AFTER `gender`;
