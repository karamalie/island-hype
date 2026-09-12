"use server";

// lib/actions/delete-impact.ts
//
// What a delete will actually destroy, counted before anyone confirms it.
//
// The admin panel used to ask `confirm("Delete this location?")` and then fail
// with "Failed to delete location", because Package.locationId and
// Accommodation.locationId have no onDelete rule — Prisma defaults those to
// Restrict, so the database refused. Staff got a native browser dialog that told
// them nothing, followed by an error that explained nothing.
//
// Two things had to be true to fix that. The person has to be told what goes,
// item by item, before they commit; and the delete then has to actually work.
//
// A NOTE ON WHY THE CASCADE IS IN CODE, NOT IN THE SCHEMA. It would be one line
// per relation to add `onDelete: Cascade` and let MySQL do this. That is the
// wrong place for it: deleting an island would then silently destroy every
// package on it from anywhere — a script, Prisma Studio, a stray query — with no
// record and no confirmation. Leaving the constraint as Restrict means the
// database refuses by default and the only path that can delete a whole island is
// this one, which counts the damage first and makes someone confirm it.

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

/** One line in the "this will also delete" list. */
export interface ImpactLine {
  /** "3 packages", "1 room type" */
  label: string;
  /** Up to three names, so the list is concrete rather than just a number. */
  examples: string[];
  /**
   * true when the records are destroyed outright. false for things that merely
   * detach — an enquiry survives its package, and an activity coming off a
   * package does not delete the package.
   */
  destroyed: boolean;
}

export interface DeleteImpact {
  /** The thing being deleted. */
  name: string;
  lines: ImpactLine[];
  /** Total records destroyed besides the subject itself. */
  total: number;
  /** Anything of substance goes, so the modal should demand a typed name. */
  requiresTypedName: boolean;
}

async function guard() {
  const session = await getSession();
  return session?.isLoggedIn ? null : "Unauthorized";
}

function plural(n: number, one: string, many?: string) {
  return `${n} ${n === 1 ? one : many ?? `${one}s`}`;
}

function line(
  n: number,
  one: string,
  examples: string[],
  destroyed = true,
  many?: string
): ImpactLine | null {
  if (n === 0) return null;
  return { label: plural(n, one, many), examples: examples.slice(0, 3), destroyed };
}

/**
 * Packages that die with a location: the ones on it, plus the ones that point at
 * an accommodation on it.
 *
 * That second half is not hypothetical tidiness. Package carries both locationId
 * and accommodationId and nothing enforces that they agree, so a package filed
 * under a different island can still be staying at a hotel on this one. Deleting
 * the hotel and leaving that package behind would leave a row pointing at
 * nothing — or, given the Restrict constraint, would make the whole delete fail
 * halfway.
 */
export async function locationDeleteImpact(
  id: string
): Promise<DeleteImpact | { error: string }> {
  const bad = await guard();
  if (bad) return { error: bad };

  const location = await prisma.location.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!location) return { error: "That island no longer exists." };

  const accommodations = await prisma.accommodation.findMany({
    where: { locationId: id },
    select: { id: true, name: true },
  });
  const accIds = accommodations.map((a) => a.id);

  const packages = await prisma.package.findMany({
    where: {
      OR: [
        { locationId: id },
        ...(accIds.length ? [{ accommodationId: { in: accIds } }] : []),
      ],
    },
    select: { id: true, name: true },
  });
  const activities = await prisma.activity.findMany({
    where: { locationId: id },
    select: { name: true },
  });

  const [images, faqs, seasonMonths, stayTypes, inquiries] = await Promise.all([
    prisma.locationImage.count({ where: { locationId: id } }),
    prisma.faqItem.count({ where: { locationId: id } }),
    prisma.seasonMonth.count({ where: { locationId: id } }),
    prisma.locationStayType.count({ where: { locationId: id } }),
    packages.length
      ? prisma.inquiry.count({ where: { packageId: { in: packages.map((p) => p.id) } } })
      : Promise.resolve(0),
  ]);

  const lines = [
    line(packages.length, "package", packages.map((p) => p.name)),
    line(accommodations.length, "place to stay", accommodations.map((a) => a.name), true, "places to stay"),
    line(activities.length, "activity", activities.map((a) => a.name), true, "activities"),
    line(stayTypes, "stay type on this island", [], true, "stay types on this island"),
    line(seasonMonths, "month of the season calendar", [], true, "months of the season calendar"),
    line(faqs, "question and answer", [], true, "questions and answers"),
    line(images, "photo", [], true, "photos"),
    // Not destroyed: enquiries keep the package name they were made against.
    line(inquiries, "past enquiry", [], false, "past enquiries"),
  ].filter((l): l is ImpactLine => l !== null);

  const total = packages.length + accommodations.length + activities.length;
  return {
    name: location.name,
    lines,
    total,
    requiresTypedName: total > 0,
  };
}

export async function accommodationDeleteImpact(
  id: string
): Promise<DeleteImpact | { error: string }> {
  const bad = await guard();
  if (bad) return { error: bad };

  const acc = await prisma.accommodation.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!acc) return { error: "That place no longer exists." };

  const packages = await prisma.package.findMany({
    where: { accommodationId: id },
    select: { id: true, name: true },
  });
  const [rooms, facilities, images, faqs, inquiries] = await Promise.all([
    prisma.roomType.findMany({ where: { accommodationId: id }, select: { name: true } }),
    prisma.facility.count({ where: { accommodationId: id } }),
    prisma.accommodationImage.count({ where: { accommodationId: id } }),
    prisma.faqItem.count({ where: { accommodationId: id } }),
    packages.length
      ? prisma.inquiry.count({ where: { packageId: { in: packages.map((p) => p.id) } } })
      : Promise.resolve(0),
  ]);

  const lines = [
    line(packages.length, "package", packages.map((p) => p.name)),
    line(rooms.length, "room type", rooms.map((r) => r.name)),
    line(facilities, "facility", [], true, "facilities"),
    line(faqs, "question and answer", [], true, "questions and answers"),
    line(images, "photo", [], true, "photos"),
    line(inquiries, "past enquiry", [], false, "past enquiries"),
  ].filter((l): l is ImpactLine => l !== null);

  return {
    name: acc.name,
    lines,
    total: packages.length + rooms.length,
    requiresTypedName: packages.length > 0,
  };
}

/**
 * An activity is the mild case, and the copy should say so. Removing it takes it
 * off the packages that offer it; it does not delete those packages.
 */
export async function activityDeleteImpact(
  id: string
): Promise<DeleteImpact | { error: string }> {
  const bad = await guard();
  if (bad) return { error: bad };

  const activity = await prisma.activity.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!activity) return { error: "That activity no longer exists." };

  const links = await prisma.packageActivity.findMany({
    where: { activityId: id },
    select: { package: { select: { name: true } } },
  });
  const images = await prisma.activityImage.count({ where: { activityId: id } });

  const lines = [
    line(links.length, "package offers it", links.map((l) => l.package.name), false, "packages offer it"),
    line(images, "photo", [], true, "photos"),
  ].filter((l): l is ImpactLine => l !== null);

  return { name: activity.name, lines, total: 0, requiresTypedName: false };
}

export async function packageDeleteImpact(
  id: string
): Promise<DeleteImpact | { error: string }> {
  const bad = await guard();
  if (bad) return { error: bad };

  const pkg = await prisma.package.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!pkg) return { error: "That package no longer exists." };

  const [pricing, inclusions, activities, faqs, images, blackouts, offers, inquiries] =
    await Promise.all([
      prisma.packagePricing.count({ where: { packageId: id } }),
      prisma.packageInclusion.count({ where: { packageId: id } }),
      prisma.packageActivity.count({ where: { packageId: id } }),
      prisma.faqItem.count({ where: { packageId: id } }),
      prisma.packageImage.count({ where: { packageId: id } }),
      prisma.blackoutRange.count({ where: { packageId: id } }),
      prisma.offer.count({ where: { packageId: id } }),
      prisma.inquiry.count({ where: { packageId: id } }),
    ]);

  const lines = [
    line(pricing, "price row", [], true, "price rows"),
    line(inclusions, "line of what's included", [], true, "lines of what's included"),
    line(offers, "offer", [], true, "offers"),
    line(activities, "linked activity", [], false, "linked activities"),
    line(blackouts, "closed date range", [], true, "closed date ranges"),
    line(faqs, "question and answer", [], true, "questions and answers"),
    line(images, "photo", [], true, "photos"),
    line(inquiries, "past enquiry", [], false, "past enquiries"),
  ].filter((l): l is ImpactLine => l !== null);

  return {
    name: pkg.name,
    lines,
    total: pricing + inclusions + offers,
    requiresTypedName: inquiries > 0,
  };
}

/**
 * An offer is a leaf — nothing hangs off it. It still goes through the same modal
 * rather than a native confirm, so that every delete in the panel behaves the
 * same way and none of them block the browser with an OS dialog.
 */
export async function offerDeleteImpact(
  id: string
): Promise<DeleteImpact | { error: string }> {
  const bad = await guard();
  if (bad) return { error: bad };

  const offer = await prisma.offer.findUnique({
    where: { id },
    select: { name: true, package: { select: { name: true } } },
  });
  if (!offer) return { error: "That offer no longer exists." };

  return {
    name: offer.name,
    lines: [
      {
        label: `The badge and panel on ${offer.package.name}`,
        examples: [],
        destroyed: true,
      },
    ],
    total: 0,
    requiresTypedName: false,
  };
}
