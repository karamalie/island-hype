-- AlterTable
ALTER TABLE `Accommodation` DROP COLUMN `amenities`,
    DROP COLUMN `roomTypes`,
    ADD COLUMN `absentNote` TEXT NULL,
    ADD COLUMN `boardOptions` VARCHAR(160) NULL,
    ADD COLUMN `houseReef` VARCHAR(160) NULL,
    ADD COLUMN `suits` VARCHAR(160) NULL;

-- AlterTable
ALTER TABLE `Location` ADD COLUMN `bestMonths` VARCHAR(80) NULL,
    ADD COLUMN `knownFor` VARCHAR(120) NULL,
    ADD COLUMN `region` VARCHAR(120) NULL,
    ADD COLUMN `seasonHighlightLabel` VARCHAR(40) NULL;

-- AlterTable
ALTER TABLE `Package` ADD COLUMN `badge` VARCHAR(40) NULL,
    ADD COLUMN `bestMonths` VARCHAR(80) NULL,
    ADD COLUMN `boardBasis` ENUM('ROOM_ONLY', 'BED_AND_BREAKFAST', 'HALF_BOARD', 'FULL_BOARD', 'ALL_INCLUSIVE') NULL,
    ADD COLUMN `longBlurb` TEXT NULL,
    ADD COLUMN `mealPlan` VARCHAR(160) NULL;

-- CreateTable
CREATE TABLE `BlackoutRange` (
    `id` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `reason` VARCHAR(160) NULL,
    `packageId` VARCHAR(191) NULL,
    `accommodationId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BlackoutRange_packageId_idx`(`packageId`),
    INDEX `BlackoutRange_accommodationId_idx`(`accommodationId`),
    INDEX `BlackoutRange_startDate_endDate_idx`(`startDate`, `endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FaqItem` (
    `id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(300) NOT NULL,
    `answer` TEXT NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `packageId` VARCHAR(191) NULL,
    `accommodationId` VARCHAR(191) NULL,
    `locationId` VARCHAR(191) NULL,

    INDEX `FaqItem_packageId_idx`(`packageId`),
    INDEX `FaqItem_accommodationId_idx`(`accommodationId`),
    INDEX `FaqItem_locationId_idx`(`locationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomType` (
    `id` VARCHAR(191) NOT NULL,
    `accommodationId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `blurb` TEXT NULL,
    `nightlyFrom` DOUBLE NULL,
    `size` VARCHAR(40) NULL,
    `sleeps` VARCHAR(60) NULL,
    `access` VARCHAR(60) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `RoomType_accommodationId_idx`(`accommodationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Facility` (
    `id` VARCHAR(191) NOT NULL,
    `accommodationId` VARCHAR(191) NOT NULL,
    `group` VARCHAR(60) NOT NULL,
    `item` VARCHAR(160) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `Facility_accommodationId_idx`(`accommodationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SeasonMonth` (
    `id` VARCHAR(191) NOT NULL,
    `locationId` VARCHAR(191) NOT NULL,
    `month` SMALLINT NOT NULL,
    `state` ENUM('BEST', 'HIGHLIGHT', 'WETTER') NOT NULL,

    INDEX `SeasonMonth_locationId_idx`(`locationId`),
    UNIQUE INDEX `SeasonMonth_locationId_month_key`(`locationId`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StayType` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(80) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `band` VARCHAR(80) NOT NULL,
    `blurb` TEXT NOT NULL,
    `nightlyFrom` DOUBLE NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `StayType_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LocationStayType` (
    `id` VARCHAR(191) NOT NULL,
    `locationId` VARCHAR(191) NOT NULL,
    `stayTypeId` VARCHAR(191) NOT NULL,
    `blurb` TEXT NULL,
    `nightlyFrom` DOUBLE NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `LocationStayType_locationId_idx`(`locationId`),
    INDEX `LocationStayType_stayTypeId_idx`(`stayTypeId`),
    UNIQUE INDEX `LocationStayType_locationId_stayTypeId_key`(`locationId`, `stayTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(60) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Tag_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageTag` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,

    INDEX `PackageTag_packageId_idx`(`packageId`),
    INDEX `PackageTag_tagId_idx`(`tagId`),
    UNIQUE INDEX `PackageTag_packageId_tagId_key`(`packageId`, `tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BlackoutRange` ADD CONSTRAINT `BlackoutRange_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlackoutRange` ADD CONSTRAINT `BlackoutRange_accommodationId_fkey` FOREIGN KEY (`accommodationId`) REFERENCES `Accommodation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FaqItem` ADD CONSTRAINT `FaqItem_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FaqItem` ADD CONSTRAINT `FaqItem_accommodationId_fkey` FOREIGN KEY (`accommodationId`) REFERENCES `Accommodation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FaqItem` ADD CONSTRAINT `FaqItem_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomType` ADD CONSTRAINT `RoomType_accommodationId_fkey` FOREIGN KEY (`accommodationId`) REFERENCES `Accommodation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Facility` ADD CONSTRAINT `Facility_accommodationId_fkey` FOREIGN KEY (`accommodationId`) REFERENCES `Accommodation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeasonMonth` ADD CONSTRAINT `SeasonMonth_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LocationStayType` ADD CONSTRAINT `LocationStayType_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LocationStayType` ADD CONSTRAINT `LocationStayType_stayTypeId_fkey` FOREIGN KEY (`stayTypeId`) REFERENCES `StayType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageTag` ADD CONSTRAINT `PackageTag_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageTag` ADD CONSTRAINT `PackageTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

