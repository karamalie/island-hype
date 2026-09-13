-- The star rating moves to the island, and the island gains what it was missing.
--
-- starRating sat on Accommodation, where the rows are villa types — "Water Villa
-- with Pool + Slide", "Beach Pavillion". Rating a villa four stars says nothing
-- anyone means by a star rating; the resort is what carries one. Every location's
-- stays already held a single shared value (Olhuveli all 4, Siyam World all 5),
-- so the copy below is a copy and not a judgement.
--
-- ORDER MATTERS. Everything here is additive except the final DROP, which is
-- split out for production: the running code reads Accommodation.starRating
-- until the new build is live.
ALTER TABLE `Location` ADD COLUMN `starRating` SMALLINT NULL,
    ADD COLUMN `termsText` TEXT NULL,
    ADD COLUMN `privacyText` TEXT NULL,
    ADD COLUMN `importantInfo` TEXT NULL;

UPDATE `Location` l
SET `starRating` = (
  SELECT MAX(a.`starRating`) FROM `Accommodation` a WHERE a.`locationId` = l.`id`
);

-- What the island offers, as opposed to a particular stay.
CREATE TABLE `LocationAmenity` (
    `id` VARCHAR(191) NOT NULL,
    `locationId` VARCHAR(191) NOT NULL,
    `group` VARCHAR(60) NOT NULL,
    `item` VARCHAR(160) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `LocationAmenity_locationId_idx`(`locationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- How guests get there. One global list, chosen per package.
CREATE TABLE `TransferOption` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `details` TEXT NULL,
    `conditions` TEXT NULL,
    `policy` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Package` ADD COLUMN `baggageInfo` TEXT NULL,
    ADD COLUMN `transferOptionId` VARCHAR(191) NULL;

-- SetNull, not Cascade: retiring a transfer option must never delete the
-- packages that used it.
ALTER TABLE `Package` ADD CONSTRAINT `Package_transferOptionId_fkey`
    FOREIGN KEY (`transferOptionId`) REFERENCES `TransferOption`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `LocationAmenity` ADD CONSTRAINT `LocationAmenity_locationId_fkey`
    FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- The contract step. On production this runs only after the new build is live.
ALTER TABLE `Accommodation` DROP COLUMN `starRating`;
