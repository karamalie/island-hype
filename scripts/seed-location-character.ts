// scripts/seed-location-character.ts
//
// The Locations page exists to argue that the atolls are not interchangeable, and
// it cannot make that argument out of an empty database. Five of the six islands
// had no region, no "known for" and no best months — so every row rendered the
// same four facts with three of them blank, and the only thing left to compare
// was the transfer time.
//
// This fills in what actually distinguishes each one, plus the twelve-month
// season data the detail page's calendar needs.
//
// Idempotent. Run with: npx tsx scripts/seed-location-character.ts

import { PrismaClient, type SeasonState } from "@prisma/client";

const db = new PrismaClient();

type Months = Partial<Record<number, SeasonState>>;

/** Dry season Dec–Apr, wet May–Nov, with the highlight window named per island. */
function months(args: {
  best: number[];
  highlight?: number[];
  wetter?: number[];
}): Months {
  const out: Months = {};
  for (const m of args.best) out[m] = "BEST";
  for (const m of args.highlight ?? []) out[m] = "HIGHLIGHT";
  for (const m of args.wetter ?? []) out[m] = "WETTER";
  return out;
}

const LOCATIONS: {
  slug: string;
  region: string;
  knownFor: string;
  bestMonths: string;
  seasonHighlightLabel: string | null;
  shortDesc: string;
  season: Months;
}[] = [
  {
    slug: "baros",
    region: "North Malé · single-island resort",
    knownFor: "House reef, short transfer",
    bestMonths: "December to April",
    seasonHighlightLabel: null,
    shortDesc:
      "Twenty-five minutes from arrivals and a reef that starts at the villa steps — the shortest transfer of anything we sell.",
    season: months({ best: [12, 1, 2, 3, 4], wetter: [5, 6, 7, 8, 9, 10, 11] }),
  },
  {
    slug: "dhigurah",
    region: "South Ari · local island",
    knownFor: "Whale sharks, a 3km beach",
    bestMonths: "Year round for whale sharks",
    seasonHighlightLabel: "Whale sharks",
    shortDesc:
      "One of the few places on earth with whale sharks all year, on a long thin island with three kilometres of beach and not much else.",
    season: months({
      best: [12, 1, 2, 3, 4],
      highlight: [5, 6, 7, 8, 9, 10, 11],
    }),
  },
  {
    slug: "fulidhoo",
    region: "Vaavu · smallest inhabited atoll",
    knownFor: "Nurse sharks, channel diving",
    bestMonths: "December to April",
    seasonHighlightLabel: null,
    shortDesc:
      "Nurse sharks and stingrays come into the harbour most evenings, and the channels outside carry the fastest water in the chain.",
    season: months({ best: [12, 1, 2, 3, 4], wetter: [5, 6, 7, 8, 9, 10, 11] }),
  },
  {
    slug: "maafushi",
    region: "South Malé · local island",
    knownFor: "Value, sandbanks",
    bestMonths: "Year round",
    seasonHighlightLabel: "Mantas",
    shortDesc:
      "The local island that got good at hosting. Family-run guesthouses, boats leaving all morning, and no seaplane bill attached to any of it.",
    season: months({
      best: [12, 1, 2, 3, 4],
      highlight: [6, 7, 8, 9, 10, 11],
      wetter: [5],
    }),
  },
  {
    slug: "soneva-fushi",
    region: "Baa · UNESCO biosphere reserve",
    knownFor: "Hanifaru mantas, jungle island",
    bestMonths: "January to April",
    seasonHighlightLabel: "Mantas",
    shortDesc:
      "A jungle island inside a biosphere reserve, twenty minutes by boat from Hanifaru Bay — where the mantas gather in numbers that are hard to credit.",
    season: months({
      best: [1, 2, 3, 4, 12],
      highlight: [6, 7, 8, 9, 10, 11],
      wetter: [5],
    }),
  },
  {
    slug: "thulusdhoo",
    region: "North Malé · surf island",
    knownFor: "Cokes and Chickens surf breaks",
    bestMonths: "April to October for swell",
    seasonHighlightLabel: "Swell",
    shortDesc:
      "A working local island that happens to sit beside two of the best waves in the country, forty-five minutes out by speedboat.",
    season: months({
      best: [12, 1, 2, 3],
      highlight: [4, 5, 6, 7, 8, 9, 10],
      wetter: [11],
    }),
  },
];

async function main() {
  for (const l of LOCATIONS) {
    const loc = await db.location.findUnique({ where: { slug: l.slug } });
    if (!loc) {
      console.log("  ! no location", l.slug);
      continue;
    }

    await db.location.update({
      where: { id: loc.id },
      data: {
        region: l.region,
        knownFor: l.knownFor,
        bestMonths: l.bestMonths,
        seasonHighlightLabel: l.seasonHighlightLabel,
        shortDesc: l.shortDesc,
      },
    });

    await db.seasonMonth.deleteMany({ where: { locationId: loc.id } });
    await db.seasonMonth.createMany({
      data: Object.entries(l.season).map(([month, state]) => ({
        locationId: loc.id,
        month: Number(month),
        state: state as SeasonState,
      })),
    });
  }
}

main()
  .then(async () => {
    const rows = await db.location.findMany({
      where: { isActive: true },
      include: { _count: { select: { seasonMonths: true } } },
      orderBy: { name: "asc" },
    });
    for (const r of rows) {
      console.log(
        `  ${r.name.padEnd(14)} ${(r.region ?? "—").padEnd(34)} ${(r.knownFor ?? "—").padEnd(30)} ${r._count.seasonMonths} months`
      );
    }
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
