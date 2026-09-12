-- Experiences removed from the product entirely (FE + admin), per client decision 2026-09-12.
-- The package "day by day" itinerary is also removed: Island Hype sells fixed packages and does
-- not commit to a daily schedule. Suggestions are now driven by PackageActivity -> Activity,
-- where isIncluded distinguishes what is in the price from optional add-ons.

-- DropForeignKey
ALTER TABLE `PackageExperience` DROP FOREIGN KEY `PackageExperience_experienceId_fkey`;
ALTER TABLE `PackageExperience` DROP FOREIGN KEY `PackageExperience_packageId_fkey`;
ALTER TABLE `LocationExperience` DROP FOREIGN KEY `LocationExperience_experienceId_fkey`;
ALTER TABLE `LocationExperience` DROP FOREIGN KEY `LocationExperience_locationId_fkey`;
ALTER TABLE `ExperienceImage` DROP FOREIGN KEY `ExperienceImage_experienceId_fkey`;
ALTER TABLE `PackageItinerary` DROP FOREIGN KEY `PackageItinerary_packageId_fkey`;

-- DropTable
DROP TABLE `PackageExperience`;
DROP TABLE `LocationExperience`;
DROP TABLE `ExperienceImage`;
DROP TABLE `Experience`;
DROP TABLE `PackageItinerary`;

-- AlterTable: per-package suggestion copy and explicit ordering
ALTER TABLE `PackageActivity`
  ADD COLUMN `note` TEXT NULL,
  ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0;

-- AlterTable: allow date-scoped seasonal pricing rows per market
-- (the old unique constraint permitted exactly one price row per package per market)
DROP INDEX `PackagePricing_packageId_market_key` ON `PackagePricing`;
CREATE INDEX `PackagePricing_packageId_market_idx` ON `PackagePricing`(`packageId`, `market`);
