-- CreateTable
CREATE TABLE `Location` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `shortDesc` VARCHAR(300) NULL,
    `atoll` VARCHAR(191) NOT NULL,
    `island` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `transferTime` INTEGER NULL,
    `transferType` ENUM('SPEEDBOAT', 'SEAPLANE', 'DOMESTIC_FLIGHT', 'FERRY', 'YACHT') NULL,
    `transferInfo` TEXT NULL,
    `coverImage` VARCHAR(191) NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Location_slug_key`(`slug`),
    INDEX `Location_atoll_idx`(`atoll`),
    INDEX `Location_isActive_idx`(`isActive`),
    INDEX `Location_isFeatured_idx`(`isFeatured`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LocationImage` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `locationId` VARCHAR(191) NOT NULL,

    INDEX `LocationImage_locationId_idx`(`locationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Accommodation` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `type` ENUM('RESORT', 'GUESTHOUSE', 'HOTEL', 'LIVEABOARD') NOT NULL,
    `shortDesc` VARCHAR(300) NULL,
    `description` TEXT NOT NULL,
    `starRating` SMALLINT NULL,
    `roomTypes` JSON NOT NULL,
    `amenities` JSON NOT NULL,
    `coverImage` VARCHAR(191) NULL,
    `locationId` VARCHAR(191) NOT NULL,
    `contactEmail` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Accommodation_slug_key`(`slug`),
    INDEX `Accommodation_locationId_idx`(`locationId`),
    INDEX `Accommodation_type_idx`(`type`),
    INDEX `Accommodation_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccommodationImage` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `accommodationId` VARCHAR(191) NOT NULL,

    INDEX `AccommodationImage_accommodationId_idx`(`accommodationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Experience` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `shortDesc` VARCHAR(300) NULL,
    `description` TEXT NOT NULL,
    `icon` VARCHAR(191) NULL,
    `coverImage` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Experience_slug_key`(`slug`),
    INDEX `Experience_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExperienceImage` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `experienceId` VARCHAR(191) NOT NULL,

    INDEX `ExperienceImage_experienceId_idx`(`experienceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LocationExperience` (
    `id` VARCHAR(191) NOT NULL,
    `locationId` VARCHAR(191) NOT NULL,
    `experienceId` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,

    INDEX `LocationExperience_locationId_idx`(`locationId`),
    INDEX `LocationExperience_experienceId_idx`(`experienceId`),
    UNIQUE INDEX `LocationExperience_locationId_experienceId_key`(`locationId`, `experienceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Activity` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `shortDesc` VARCHAR(300) NULL,
    `description` TEXT NOT NULL,
    `category` ENUM('WATER_SPORTS', 'DIVING', 'SNORKELING', 'FISHING', 'EXCURSION', 'WELLNESS', 'CULTURAL', 'ADVENTURE') NOT NULL,
    `duration` INTEGER NULL,
    `coverImage` VARCHAR(191) NULL,
    `locationId` VARCHAR(191) NOT NULL,
    `localPrice` DOUBLE NULL,
    `internationalPrice` DOUBLE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Activity_slug_key`(`slug`),
    INDEX `Activity_locationId_idx`(`locationId`),
    INDEX `Activity_category_idx`(`category`),
    INDEX `Activity_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityImage` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `activityId` VARCHAR(191) NOT NULL,

    INDEX `ActivityImage_activityId_idx`(`activityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Package` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `shortDesc` VARCHAR(300) NULL,
    `description` TEXT NOT NULL,
    `highlights` JSON NOT NULL,
    `minNights` INTEGER NOT NULL DEFAULT 1,
    `maxNights` INTEGER NULL,
    `maxGuests` INTEGER NULL,
    `bookingWindowStart` DATETIME(3) NULL,
    `bookingWindowEnd` DATETIME(3) NULL,
    `travelWindowStart` DATETIME(3) NULL,
    `travelWindowEnd` DATETIME(3) NULL,
    `terms` TEXT NULL,
    `cancellationPolicy` TEXT NULL,
    `bookingInfo` TEXT NULL,
    `coverImage` VARCHAR(191) NULL,
    `locationId` VARCHAR(191) NOT NULL,
    `accommodationId` VARCHAR(191) NOT NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Package_slug_key`(`slug`),
    INDEX `Package_locationId_idx`(`locationId`),
    INDEX `Package_accommodationId_idx`(`accommodationId`),
    INDEX `Package_isActive_idx`(`isActive`),
    INDEX `Package_isFeatured_idx`(`isFeatured`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageImage` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `packageId` VARCHAR(191) NOT NULL,

    INDEX `PackageImage_packageId_idx`(`packageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackagePricing` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `market` ENUM('LOCAL', 'INTERNATIONAL') NOT NULL,
    `basePrice` DOUBLE NOT NULL,
    `couplePrice` DOUBLE NOT NULL,
    `extraAdultPrice` DOUBLE NULL,
    `childPrice` DOUBLE NULL,
    `infantPrice` DOUBLE NULL,
    `singleSupplement` DOUBLE NULL,
    `childAgeMin` INTEGER NOT NULL DEFAULT 2,
    `childAgeMax` INTEGER NOT NULL DEFAULT 11,
    `validFrom` DATETIME(3) NULL,
    `validUntil` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PackagePricing_packageId_idx`(`packageId`),
    UNIQUE INDEX `PackagePricing_packageId_market_key`(`packageId`, `market`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageInclusion` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `category` ENUM('ACCOMMODATION', 'MEALS', 'TRANSFER', 'ACTIVITY', 'EQUIPMENT', 'SERVICE') NOT NULL,
    `item` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `PackageInclusion_packageId_idx`(`packageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageItinerary` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `dayNumber` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,

    INDEX `PackageItinerary_packageId_idx`(`packageId`),
    UNIQUE INDEX `PackageItinerary_packageId_dayNumber_key`(`packageId`, `dayNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageExperience` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `experienceId` VARCHAR(191) NOT NULL,

    INDEX `PackageExperience_packageId_idx`(`packageId`),
    INDEX `PackageExperience_experienceId_idx`(`experienceId`),
    UNIQUE INDEX `PackageExperience_packageId_experienceId_key`(`packageId`, `experienceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageActivity` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `activityId` VARCHAR(191) NOT NULL,
    `isIncluded` BOOLEAN NOT NULL DEFAULT true,

    INDEX `PackageActivity_packageId_idx`(`packageId`),
    INDEX `PackageActivity_activityId_idx`(`activityId`),
    UNIQUE INDEX `PackageActivity_packageId_activityId_key`(`packageId`, `activityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Offer` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `badge` VARCHAR(191) NULL,
    `discountType` ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_NIGHTS') NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `code` VARCHAR(191) NULL,
    `validFrom` DATETIME(3) NOT NULL,
    `validUntil` DATETIME(3) NOT NULL,
    `minNights` INTEGER NULL,
    `minGuests` INTEGER NULL,
    `market` ENUM('LOCAL', 'INTERNATIONAL') NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Offer_slug_key`(`slug`),
    INDEX `Offer_packageId_idx`(`packageId`),
    INDEX `Offer_isActive_idx`(`isActive`),
    INDEX `Offer_validFrom_validUntil_idx`(`validFrom`, `validUntil`),
    INDEX `Offer_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inquiry` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `nationality` VARCHAR(191) NULL,
    `packageId` VARCHAR(191) NULL,
    `packageName` VARCHAR(191) NULL,
    `checkIn` DATETIME(3) NULL,
    `checkOut` DATETIME(3) NULL,
    `adults` INTEGER NOT NULL DEFAULT 2,
    `children` INTEGER NOT NULL DEFAULT 0,
    `infants` INTEGER NOT NULL DEFAULT 0,
    `message` TEXT NOT NULL,
    `specialRequests` TEXT NULL,
    `arrivalFlight` VARCHAR(191) NULL,
    `departureFlight` VARCHAR(191) NULL,
    `market` ENUM('LOCAL', 'INTERNATIONAL') NOT NULL,
    `estimatedPriceUSD` DOUBLE NULL,
    `estimatedPriceMVR` DOUBLE NULL,
    `status` ENUM('NEW', 'CONTACTED', 'NEGOTIATING', 'BOOKED', 'CANCELLED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    `notes` TEXT NULL,
    `respondedAt` DATETIME(3) NULL,
    `respondedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Inquiry_packageId_idx`(`packageId`),
    INDEX `Inquiry_status_idx`(`status`),
    INDEX `Inquiry_market_idx`(`market`),
    INDEX `Inquiry_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteSetting` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SiteSetting_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LocationImage` ADD CONSTRAINT `LocationImage_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accommodation` ADD CONSTRAINT `Accommodation_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccommodationImage` ADD CONSTRAINT `AccommodationImage_accommodationId_fkey` FOREIGN KEY (`accommodationId`) REFERENCES `Accommodation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExperienceImage` ADD CONSTRAINT `ExperienceImage_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `Experience`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LocationExperience` ADD CONSTRAINT `LocationExperience_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LocationExperience` ADD CONSTRAINT `LocationExperience_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `Experience`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityImage` ADD CONSTRAINT `ActivityImage_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `Activity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Package` ADD CONSTRAINT `Package_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Package` ADD CONSTRAINT `Package_accommodationId_fkey` FOREIGN KEY (`accommodationId`) REFERENCES `Accommodation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageImage` ADD CONSTRAINT `PackageImage_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackagePricing` ADD CONSTRAINT `PackagePricing_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageInclusion` ADD CONSTRAINT `PackageInclusion_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageItinerary` ADD CONSTRAINT `PackageItinerary_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageExperience` ADD CONSTRAINT `PackageExperience_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageExperience` ADD CONSTRAINT `PackageExperience_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `Experience`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageActivity` ADD CONSTRAINT `PackageActivity_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageActivity` ADD CONSTRAINT `PackageActivity_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `Activity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Offer` ADD CONSTRAINT `Offer_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inquiry` ADD CONSTRAINT `Inquiry_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

