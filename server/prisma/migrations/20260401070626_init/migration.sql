-- CreateTable
CREATE TABLE `donors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `donorCode` VARCHAR(30) NOT NULL,
    `firstName` VARCHAR(80) NOT NULL,
    `lastName` VARCHAR(80) NOT NULL,
    `birthday` DATE NULL,
    `gender` ENUM('FEMALE', 'MALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY') NULL,
    `country` VARCHAR(80) NOT NULL,
    `state` VARCHAR(80) NULL,
    `city` VARCHAR(80) NULL,
    `streetAddress` VARCHAR(255) NULL,
    `postalCode` VARCHAR(20) NULL,
    `email` VARCHAR(120) NULL,
    `phone` VARCHAR(30) NULL,
    `preferredLanguage` VARCHAR(30) NULL,
    `registrationDate` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `donors_donorCode_key`(`donorCode`),
    UNIQUE INDEX `donors_email_key`(`email`),
    INDEX `donors_lastName_firstName_idx`(`lastName`, `firstName`),
    INDEX `donors_registrationDate_idx`(`registrationDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeCode` VARCHAR(30) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `gender` ENUM('FEMALE', 'MALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY') NULL,
    `birthday` DATE NULL,
    `contact` VARCHAR(120) NULL,
    `schedule` VARCHAR(120) NULL,
    `hometown` VARCHAR(120) NULL,
    `position` VARCHAR(100) NULL,
    `email` VARCHAR(120) NULL,
    `passwordHash` VARCHAR(255) NULL,
    `role` ENUM('ADMIN', 'OPERATIONS', 'FINANCE', 'EVENT', 'VOLUNTEER') NOT NULL DEFAULT 'OPERATIONS',
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `employees_employeeCode_key`(`employeeCode`),
    UNIQUE INDEX `employees_email_key`(`email`),
    INDEX `employees_status_role_idx`(`status`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donation_kits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kitCode` VARCHAR(30) NOT NULL,
    `kitName` VARCHAR(120) NOT NULL,
    `description` VARCHAR(255) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `donation_kits_kitCode_key`(`kitCode`),
    INDEX `donation_kits_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `presses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pressName` VARCHAR(120) NOT NULL,
    `description` VARCHAR(255) NULL,
    `contactPerson` VARCHAR(120) NULL,
    `phoneNumber` VARCHAR(30) NULL,
    `email` VARCHAR(120) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `presses_pressName_key`(`pressName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `book_series` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seriesName` VARCHAR(120) NOT NULL,
    `description` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `book_series_seriesName_key`(`seriesName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `book_formats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `formatType` VARCHAR(50) NOT NULL,
    `language` VARCHAR(30) NOT NULL,
    `fileSizeMb` DECIMAL(8, 2) NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `book_formats_isAvailable_idx`(`isAvailable`),
    UNIQUE INDEX `book_formats_formatType_language_key`(`formatType`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `books` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pressId` INTEGER NOT NULL,
    `bookSeriesId` INTEGER NULL,
    `title` VARCHAR(180) NOT NULL,
    `bookFormatId` INTEGER NOT NULL,
    `description` VARCHAR(500) NULL,
    `pageCount` INTEGER NULL,
    `unitCost` DECIMAL(10, 2) NOT NULL,
    `currentStock` INTEGER NOT NULL DEFAULT 0,
    `reorderLevel` INTEGER NOT NULL DEFAULT 0,
    `publicationDate` DATE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `books_pressId_idx`(`pressId`),
    INDEX `books_bookSeriesId_idx`(`bookSeriesId`),
    INDEX `books_bookFormatId_idx`(`bookFormatId`),
    INDEX `books_title_idx`(`title`),
    INDEX `books_currentStock_reorderLevel_idx`(`currentStock`, `reorderLevel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `envelopes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `envelopeCode` VARCHAR(30) NOT NULL,
    `size` VARCHAR(50) NOT NULL,
    `unitCost` DECIMAL(10, 2) NOT NULL,
    `currentStock` INTEGER NOT NULL DEFAULT 0,
    `reorderLevel` INTEGER NOT NULL DEFAULT 0,
    `description` VARCHAR(255) NULL,
    `lastRestockDate` DATE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `envelopes_envelopeCode_key`(`envelopeCode`),
    INDEX `envelopes_isActive_idx`(`isActive`),
    INDEX `envelopes_currentStock_reorderLevel_idx`(`currentStock`, `reorderLevel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `boxes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `boxCode` VARCHAR(30) NOT NULL,
    `size` VARCHAR(50) NOT NULL,
    `unitCost` DECIMAL(10, 2) NOT NULL,
    `currentStock` INTEGER NOT NULL DEFAULT 0,
    `reorderLevel` INTEGER NOT NULL DEFAULT 0,
    `description` VARCHAR(255) NULL,
    `lastRestockDate` DATE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `boxes_boxCode_key`(`boxCode`),
    INDEX `boxes_isActive_idx`(`isActive`),
    INDEX `boxes_currentStock_reorderLevel_idx`(`currentStock`, `reorderLevel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kit_components` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(255) NULL,
    `donationKitId` INTEGER NOT NULL,
    `componentType` ENUM('BOOK', 'ENVELOPE', 'BOX') NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `bookId` INTEGER NULL,
    `boxId` INTEGER NULL,
    `envelopeId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `kit_components_donationKitId_idx`(`donationKitId`),
    INDEX `kit_components_bookId_idx`(`bookId`),
    INDEX `kit_components_boxId_idx`(`boxId`),
    INDEX `kit_components_envelopeId_idx`(`envelopeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventName` VARCHAR(160) NOT NULL,
    `description` VARCHAR(500) NULL,
    `type` ENUM('FUNDRAISER', 'SCHOOL_VISIT', 'COMMUNITY_OUTREACH', 'ONLINE_CAMPAIGN', 'BOOK_LAUNCH', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `country` VARCHAR(80) NOT NULL,
    `state` VARCHAR(80) NULL,
    `city` VARCHAR(80) NULL,
    `employeeId` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `events_employeeId_idx`(`employeeId`),
    INDEX `events_startDate_endDate_idx`(`startDate`, `endDate`),
    INDEX `events_isActive_type_idx`(`isActive`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotion_assets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assetCode` VARCHAR(30) NOT NULL,
    `assetCategory` ENUM('PRINT', 'DIGITAL', 'MERCHANDISE', 'DISPLAY', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `assetName` VARCHAR(160) NOT NULL,
    `description` VARCHAR(255) NULL,
    `assetType` ENUM('FLYER', 'POSTER', 'BANNER', 'BOOKMARK', 'STICKER', 'GIFT', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `promotion_assets_assetCode_key`(`assetCode`),
    INDEX `promotion_assets_isActive_assetCategory_assetType_idx`(`isActive`, `assetCategory`, `assetType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotion_inventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inventoryCode` VARCHAR(30) NOT NULL,
    `promotionInventoryType` VARCHAR(80) NOT NULL,
    `size` VARCHAR(50) NULL,
    `unitCost` DECIMAL(10, 2) NOT NULL,
    `currentStock` INTEGER NOT NULL DEFAULT 0,
    `reorderLevel` INTEGER NOT NULL DEFAULT 0,
    `description` VARCHAR(255) NULL,
    `lastRestockDate` DATE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `promotion_inventory_inventoryCode_key`(`inventoryCode`),
    INDEX `promotion_inventory_isActive_idx`(`isActive`),
    INDEX `promotion_inventory_currentStock_reorderLevel_idx`(`currentStock`, `reorderLevel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donation_receivables` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `donationCode` VARCHAR(30) NOT NULL,
    `donorId` INTEGER NOT NULL,
    `eventId` INTEGER NULL,
    `donationAmount` DECIMAL(10, 2) NOT NULL,
    `donationDate` DATE NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'RECEIPTED', 'SHIPPED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `donationKitId` INTEGER NULL,
    `employeeId` INTEGER NULL,
    `notes` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `donation_receivables_donationCode_key`(`donationCode`),
    INDEX `donation_receivables_donorId_idx`(`donorId`),
    INDEX `donation_receivables_eventId_idx`(`eventId`),
    INDEX `donation_receivables_donationKitId_idx`(`donationKitId`),
    INDEX `donation_receivables_employeeId_idx`(`employeeId`),
    INDEX `donation_receivables_donationDate_status_idx`(`donationDate`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donation_receipts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `receiptNumber` VARCHAR(30) NOT NULL,
    `donationId` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `receiptDate` DATE NOT NULL,
    `paymentMethod` ENUM('CASH', 'CARD', 'BANK_TRANSFER', 'CHECK', 'OTHER') NOT NULL,
    `transactionId` VARCHAR(80) NULL,
    `status` ENUM('ISSUED', 'VOID') NOT NULL DEFAULT 'ISSUED',
    `notes` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `donation_receipts_receiptNumber_key`(`receiptNumber`),
    INDEX `donation_receipts_donationId_idx`(`donationId`),
    INDEX `donation_receipts_receiptDate_idx`(`receiptDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shippings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `donationId` INTEGER NOT NULL,
    `trackingNumber` VARCHAR(80) NULL,
    `carrier` VARCHAR(80) NULL,
    `shippedDate` DATE NULL,
    `deliveryDate` DATE NULL,
    `shippingCost` DECIMAL(10, 2) NULL,
    `status` ENUM('PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'RETURNED', 'LOST') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `shippings_trackingNumber_key`(`trackingNumber`),
    INDEX `shippings_donationId_idx`(`donationId`),
    INDEX `shippings_status_shippedDate_idx`(`status`, `shippedDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feedback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `donationId` INTEGER NOT NULL,
    `feedbackContent` VARCHAR(1000) NOT NULL,
    `rating` INTEGER NULL,
    `feedbackDate` DATE NOT NULL,
    `responseContent` VARCHAR(1000) NULL,
    `responseDate` DATE NULL,
    `status` ENUM('NEW', 'REVIEWED', 'RESPONDED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `feedback_donationId_idx`(`donationId`),
    INDEX `feedback_status_feedbackDate_idx`(`status`, `feedbackDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_promotions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` INTEGER NOT NULL,
    `promotionAssetId` INTEGER NOT NULL,
    `promotionAssetQuantity` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `event_promotions_promotionAssetId_idx`(`promotionAssetId`),
    UNIQUE INDEX `event_promotions_eventId_promotionAssetId_key`(`eventId`, `promotionAssetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotion_gift_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` INTEGER NOT NULL,
    `promotionInventoryId` INTEGER NOT NULL,
    `giftQuantity` INTEGER NOT NULL DEFAULT 1,
    `giftDate` DATE NOT NULL,
    `status` ENUM('PLANNED', 'ASSIGNED', 'DISTRIBUTED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `promotion_gift_assignments_eventId_idx`(`eventId`),
    INDEX `promotion_gift_assignments_promotionInventoryId_idx`(`promotionInventoryId`),
    INDEX `promotion_gift_assignments_giftDate_status_idx`(`giftDate`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vendorCode` VARCHAR(30) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `contactPerson` VARCHAR(120) NULL,
    `phoneNumber` VARCHAR(30) NULL,
    `address` VARCHAR(255) NULL,
    `email` VARCHAR(120) NULL,
    `rating` INTEGER NULL,
    `supplyType` VARCHAR(100) NULL,
    `lastSupplyDate` DATE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vendors_vendorCode_key`(`vendorCode`),
    INDEX `vendors_isActive_supplyType_idx`(`isActive`, `supplyType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceNumber` VARCHAR(30) NOT NULL,
    `employeeId` INTEGER NULL,
    `invoiceDate` DATE NOT NULL,
    `dueDate` DATE NOT NULL,
    `vendorId` INTEGER NOT NULL,
    `status` ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `notes` VARCHAR(500) NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `taxAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `totalAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoices_invoiceNumber_key`(`invoiceNumber`),
    INDEX `invoices_employeeId_idx`(`employeeId`),
    INDEX `invoices_vendorId_idx`(`vendorId`),
    INDEX `invoices_invoiceDate_dueDate_status_idx`(`invoiceDate`, `dueDate`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `envelopeId` INTEGER NULL,
    `boxId` INTEGER NULL,
    `promotionInventoryId` INTEGER NULL,
    `description` VARCHAR(255) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unitPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `invoice_items_invoiceId_idx`(`invoiceId`),
    INDEX `invoice_items_envelopeId_idx`(`envelopeId`),
    INDEX `invoice_items_boxId_idx`(`boxId`),
    INDEX `invoice_items_promotionInventoryId_idx`(`promotionInventoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payables` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `remainingAmount` DECIMAL(10, 2) NOT NULL,
    `dueDate` DATE NOT NULL,
    `paymentTerms` VARCHAR(120) NULL,
    `notes` VARCHAR(255) NULL,
    `status` ENUM('OPEN', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payables_invoiceId_key`(`invoiceId`),
    INDEX `payables_dueDate_status_idx`(`dueDate`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payableId` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `paymentDate` DATE NOT NULL,
    `paymentMethod` ENUM('CASH', 'CARD', 'BANK_TRANSFER', 'CHECK', 'OTHER') NOT NULL,
    `referenceNumber` VARCHAR(80) NULL,
    `notes` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `invoice_payments_payableId_idx`(`payableId`),
    INDEX `invoice_payments_paymentDate_idx`(`paymentDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `books` ADD CONSTRAINT `books_pressId_fkey` FOREIGN KEY (`pressId`) REFERENCES `presses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `books` ADD CONSTRAINT `books_bookSeriesId_fkey` FOREIGN KEY (`bookSeriesId`) REFERENCES `book_series`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `books` ADD CONSTRAINT `books_bookFormatId_fkey` FOREIGN KEY (`bookFormatId`) REFERENCES `book_formats`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kit_components` ADD CONSTRAINT `kit_components_donationKitId_fkey` FOREIGN KEY (`donationKitId`) REFERENCES `donation_kits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kit_components` ADD CONSTRAINT `kit_components_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kit_components` ADD CONSTRAINT `kit_components_boxId_fkey` FOREIGN KEY (`boxId`) REFERENCES `boxes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kit_components` ADD CONSTRAINT `kit_components_envelopeId_fkey` FOREIGN KEY (`envelopeId`) REFERENCES `envelopes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donation_receivables` ADD CONSTRAINT `donation_receivables_donorId_fkey` FOREIGN KEY (`donorId`) REFERENCES `donors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donation_receivables` ADD CONSTRAINT `donation_receivables_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donation_receivables` ADD CONSTRAINT `donation_receivables_donationKitId_fkey` FOREIGN KEY (`donationKitId`) REFERENCES `donation_kits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donation_receivables` ADD CONSTRAINT `donation_receivables_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donation_receipts` ADD CONSTRAINT `donation_receipts_donationId_fkey` FOREIGN KEY (`donationId`) REFERENCES `donation_receivables`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shippings` ADD CONSTRAINT `shippings_donationId_fkey` FOREIGN KEY (`donationId`) REFERENCES `donation_receivables`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedback` ADD CONSTRAINT `feedback_donationId_fkey` FOREIGN KEY (`donationId`) REFERENCES `donation_receivables`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_promotions` ADD CONSTRAINT `event_promotions_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_promotions` ADD CONSTRAINT `event_promotions_promotionAssetId_fkey` FOREIGN KEY (`promotionAssetId`) REFERENCES `promotion_assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_gift_assignments` ADD CONSTRAINT `promotion_gift_assignments_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_gift_assignments` ADD CONSTRAINT `promotion_gift_assignments_promotionInventoryId_fkey` FOREIGN KEY (`promotionInventoryId`) REFERENCES `promotion_inventory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_items` ADD CONSTRAINT `invoice_items_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_items` ADD CONSTRAINT `invoice_items_envelopeId_fkey` FOREIGN KEY (`envelopeId`) REFERENCES `envelopes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_items` ADD CONSTRAINT `invoice_items_boxId_fkey` FOREIGN KEY (`boxId`) REFERENCES `boxes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_items` ADD CONSTRAINT `invoice_items_promotionInventoryId_fkey` FOREIGN KEY (`promotionInventoryId`) REFERENCES `promotion_inventory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payables` ADD CONSTRAINT `payables_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_payments` ADD CONSTRAINT `invoice_payments_payableId_fkey` FOREIGN KEY (`payableId`) REFERENCES `payables`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
