-- A package has one length, and a stay has an occupancy.
--
-- Package carried minNights (the length actually sold) and an optional
-- maxNights ceiling. The booking rail turned that pair into a Nights dropdown,
-- which offered guests lengths that were never really for sale — a 4-night
-- package listing 4 through 10. minNights was always the real answer, so it
-- becomes `nights` and the ceiling goes.
--
-- Added before the copy and dropped after it, so no package loses its length.
ALTER TABLE `Package` ADD COLUMN `nights` INTEGER NOT NULL DEFAULT 1;
UPDATE `Package` SET `nights` = `minNights` WHERE `minNights` > 0;
ALTER TABLE `Package` DROP COLUMN `minNights`;
ALTER TABLE `Package` DROP COLUMN `maxNights`;

-- Occupancy limits for a stay. Nullable: existing rows have no answer yet, and
-- guessing one would cap enquiries on villas that sleep more than we assumed.
ALTER TABLE `Accommodation` ADD COLUMN `maxAdults` SMALLINT NULL;
ALTER TABLE `Accommodation` ADD COLUMN `maxChildren` SMALLINT NULL;
