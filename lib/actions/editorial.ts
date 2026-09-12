"use server";

// lib/actions/editorial.ts
//
// Writers for the relations the redesign added. They all follow the shape of
// `updatePackageActivities`: session guard, then delete-and-recreate inside one
// transaction, then revalidate. Sort order comes from array index, so the admin
// UI can reorder by moving rows rather than typing numbers.
//
// Kept in one file because they are the same three lines of logic five times over;
// splitting them across five modules would spread the pattern without clarifying it.

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import type { SeasonState } from "@prisma/client";

type Result = { success: boolean; error?: string };

async function guard(): Promise<Result | null> {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };
  return null;
}

/** Which entity a set of FAQs hangs off. Exactly one is set. */
export type FaqOwner =
  | { packageId: string }
  | { accommodationId: string }
  | { locationId: string };

export interface FaqInput {
  question: string;
  answer: string;
}

/**
 * "Worth knowing" rows. An empty list is valid and meaningful — the section
 * renders nothing rather than an empty heading.
 */
export async function updateFaqs(owner: FaqOwner, items: FaqInput[]): Promise<Result> {
  const denied = await guard();
  if (denied) return denied;

  const clean = items.filter((i) => i.question.trim() && i.answer.trim());

  try {
    await prisma.$transaction([
      prisma.faqItem.deleteMany({ where: owner }),
      prisma.faqItem.createMany({
        data: clean.map((i, idx) => ({
          ...owner,
          question: i.question.trim(),
          answer: i.answer.trim(),
          sortOrder: idx,
        })),
      }),
    ]);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update questions" };
  }
}

export interface BlackoutInput {
  startDate: string;
  endDate: string;
  reason?: string | null;
}

/**
 * Closures and sold-out stretches. Ranges with a missing or inverted date pair are
 * dropped rather than saved, because a reversed range would silently match nothing.
 */
export async function updateBlackouts(
  owner: { packageId: string } | { accommodationId: string },
  ranges: BlackoutInput[]
): Promise<Result> {
  const denied = await guard();
  if (denied) return denied;

  const clean = ranges
    .map((r) => ({
      start: new Date(r.startDate),
      end: new Date(r.endDate),
      reason: r.reason?.trim() || null,
    }))
    .filter(
      (r) =>
        !Number.isNaN(r.start.getTime()) &&
        !Number.isNaN(r.end.getTime()) &&
        r.end >= r.start
    );

  try {
    await prisma.$transaction([
      prisma.blackoutRange.deleteMany({ where: owner }),
      prisma.blackoutRange.createMany({
        data: clean.map((r) => ({
          ...owner,
          startDate: r.start,
          endDate: r.end,
          reason: r.reason,
        })),
      }),
    ]);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update closed dates" };
  }
}

export async function updatePackageTags(
  packageId: string,
  tagIds: string[]
): Promise<Result> {
  const denied = await guard();
  if (denied) return denied;

  try {
    await prisma.$transaction([
      prisma.packageTag.deleteMany({ where: { packageId } }),
      prisma.packageTag.createMany({
        data: tagIds.map((tagId) => ({ packageId, tagId })),
      }),
    ]);
    revalidatePath("/packages");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update tags" };
  }
}

export interface SeasonInput {
  month: number;
  state: SeasonState | null;
}

/**
 * The twelve-month calendar. A null state means "unset" and is simply not stored,
 * so a location with no opinion about a month leaves that cell neutral.
 */
export async function updateLocationSeason(
  locationId: string,
  months: SeasonInput[]
): Promise<Result> {
  const denied = await guard();
  if (denied) return denied;

  const clean = months.filter(
    (m) => m.state !== null && m.month >= 1 && m.month <= 12
  ) as { month: number; state: SeasonState }[];

  try {
    await prisma.$transaction([
      prisma.seasonMonth.deleteMany({ where: { locationId } }),
      prisma.seasonMonth.createMany({
        data: clean.map((m) => ({ locationId, month: m.month, state: m.state })),
      }),
    ]);
    revalidatePath("/locations");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update the season calendar" };
  }
}

export interface LocationStayTypeInput {
  stayTypeId: string;
  blurb?: string | null;
  nightlyFrom?: number | null;
}

/**
 * Which kinds of night this island offers, with optional overrides. Only linked
 * types appear on the page — Baa is resort country and shows three of the five,
 * not all five with two marked absent.
 */
export async function updateLocationStayTypes(
  locationId: string,
  rows: LocationStayTypeInput[]
): Promise<Result> {
  const denied = await guard();
  if (denied) return denied;

  try {
    await prisma.$transaction([
      prisma.locationStayType.deleteMany({ where: { locationId } }),
      prisma.locationStayType.createMany({
        data: rows.map((r, idx) => ({
          locationId,
          stayTypeId: r.stayTypeId,
          blurb: r.blurb?.trim() || null,
          nightlyFrom: r.nightlyFrom ?? null,
          sortOrder: idx,
        })),
      }),
    ]);
    revalidatePath("/locations");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update stay types" };
  }
}
