CREATE TABLE `schedules` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `employeeId` INTEGER NOT NULL,
  `eventId` INTEGER NULL,
  `shiftDate` DATE NOT NULL,
  `startTime` VARCHAR(10) NOT NULL,
  `endTime` VARCHAR(10) NOT NULL,
  `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
  `notes` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `schedules_employeeId_idx`(`employeeId`),
  INDEX `schedules_eventId_idx`(`eventId`),
  INDEX `schedules_shiftDate_status_idx`(`shiftDate`, `status`),
  CONSTRAINT `schedules_employeeId_fkey`
    FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `schedules_eventId_fkey`
    FOREIGN KEY (`eventId`) REFERENCES `events`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
);
