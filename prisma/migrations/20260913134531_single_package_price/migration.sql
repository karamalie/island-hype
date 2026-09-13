-- Packages have one price.
--
-- PackagePricing carried two whole-package totals: basePrice for single
-- occupancy and couplePrice for two. The site only ever quoted the couple
-- figure — cards and detail pages led with couplePrice / 2 as a per-person
-- price and stated couplePrice as "total for two" — so couplePrice is the
-- number the client advertises and the one that has to survive.
--
-- Hence the copy before the drop. Without it the live Olhuveli package would
-- fall from $4,448 to its single-occupancy basePrice the moment this ran, which
-- is a price change dressed up as a schema change.
--
-- Rows where couplePrice is 0 or NULL are left alone: there is nothing to
-- preserve and basePrice is already the only figure they have.
UPDATE `PackagePricing` SET `basePrice` = `couplePrice` WHERE `couplePrice` > 0;

-- AlterTable
ALTER TABLE `PackagePricing` DROP COLUMN `couplePrice`;
