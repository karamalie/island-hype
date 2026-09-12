// lib/data/stay-types.ts
//
// The five kinds of night. Reference content rather than inventory: brief §1.3
// names these a "floor" — a section that carries the page when the catalogue is
// thin and must never be cut for being static. So this is the one list that is
// never sliced by a density rule.
//
// Per-location overrides exist because the same kind of night costs differently
// in different places: a guesthouse is $65 nationally but $95 on Dharavandhoo,
// where the divers heading for Hanifaru bid the rooms up.

import { prisma } from "@/lib/prisma";

export interface ResolvedStayType {
  id: string;
  slug: string;
  name: string;
  band: string;
  blurb: string;
  nightlyFrom: number | null;
}

export async function getStayTypes(): Promise<ResolvedStayType[]> {
  const rows = await prisma.stayType.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return rows.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    band: s.band,
    blurb: s.blurb,
    nightlyFrom: s.nightlyFrom,
  }));
}

/**
 * The stay types available on one island, with overrides applied.
 *
 * Returns only the types actually linked to the location — Baa is resort country,
 * so it shows three of the five rather than all five with two marked absent.
 * An empty result means the section does not render.
 */
export async function getStayTypesForLocation(
  locationId: string
): Promise<ResolvedStayType[]> {
  const rows = await prisma.locationStayType.findMany({
    where: { locationId, stayType: { isActive: true } },
    include: { stayType: true },
    orderBy: { sortOrder: "asc" },
  });

  return rows.map((r) => ({
    id: r.stayType.id,
    slug: r.stayType.slug,
    name: r.stayType.name,
    band: r.stayType.band,
    blurb: r.blurb ?? r.stayType.blurb,
    nightlyFrom: r.nightlyFrom ?? r.stayType.nightlyFrom,
  }));
}
