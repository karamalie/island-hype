// _migration/fix-catalogue-associations.ts
//
// Demo-data repair, 2026-09-12.
//
// The schema already guarantees the forward direction: Package.locationId and
// Package.accommodationId are both non-nullable, so a package can never exist
// without an island and a place to sleep. What it cannot express is the inverse —
// that every accommodation belongs to at least one package, and every location has
// something on it. Two rows were in exactly that state:
//
//   Kaani Beach Hotel (Maafushi)  — in 0 packages, therefore unsellable
//   Thulusdhoo (location)         — no accommodations at all, therefore no packages
//
// That matters because the whole site is built on "every stay comes as a package".
// A stay with no package has no price, no transfer and no route to enquiry.
//
// This adds the missing accommodation and two packages, and tags the whole
// catalogue so the listing's filter bar has something to filter. Idempotent.

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/** The app's own conversion constant, rounded to something a person would quote. */
const MVR = (usd: number) => Math.round((usd * 15.42) / 500) * 500;

async function main() {
  const thulusdhoo = await db.location.findUniqueOrThrow({ where: { slug: "thulusdhoo" } });
  const maafushi = await db.location.findUniqueOrThrow({ where: { slug: "maafushi" } });
  const kaani = await db.accommodation.findUniqueOrThrow({ where: { slug: "kaani-beach-hotel" } });

  // ---- 1. Thulusdhoo had nothing on it. It is the country's surf island: Cokes
  //         and Chickens break off its reef, and it is 45 minutes by speedboat.
  const lodge = await db.accommodation.upsert({
    where: { slug: "thulusdhoo-surf-lodge" },
    update: {},
    create: {
      name: "Thulusdhoo Surf Lodge",
      slug: "thulusdhoo-surf-lodge",
      type: "GUESTHOUSE",
      locationId: thulusdhoo.id,
      coverImage: "thulusdhoo-surf-lodge.jpg",
      shortDesc:
        "A board-rack guesthouse two minutes from the harbour, run by people who surf.",
      description:
        "Plain rooms above a family kitchen, a rack for your board by the door, and a dhoni that leaves for the breaks when the tide says so rather than when a timetable does. Cokes is a ten-minute ride and Chickens a little further. Between swells there is a reef to snorkel and not a great deal else to do, which is the point.",
      houseReef: "Yes — a short paddle off the harbour wall",
      suits: "Surfers, snorkellers, anyone travelling light",
      boardOptions: "Breakfast included",
      absentNote:
        "No pool, no bar, and the hot water is solar — an overcast afternoon means a cool shower.",
      isActive: true,
      sortOrder: 6,
    },
  });

  await db.roomType.deleteMany({ where: { accommodationId: lodge.id } });
  await db.roomType.createMany({
    data: [
      {
        accommodationId: lodge.id,
        name: "Sea-view double",
        blurb: "Upstairs, with a balcony you can see the break from.",
        nightlyFrom: 85,
        size: "22 m²",
        sleeps: "2 adults",
        access: "Two minutes to the harbour",
        sortOrder: 0,
      },
      {
        accommodationId: lodge.id,
        name: "Twin share",
        blurb: "Ground floor, cooler, and cheaper if you are two friends rather than a couple.",
        nightlyFrom: 65,
        size: "18 m²",
        sleeps: "2 adults",
        access: "Two minutes to the harbour",
        sortOrder: 1,
      },
    ],
  });

  await db.facility.deleteMany({ where: { accommodationId: lodge.id } });
  await db.facility.createMany({
    data: [
      { accommodationId: lodge.id, group: "Eating and drinking", item: "Family kitchen, breakfast and dinner on request", sortOrder: 0 },
      { accommodationId: lodge.id, group: "In the water", item: "Board storage, ding repair and a dhoni to the breaks", sortOrder: 1 },
      { accommodationId: lodge.id, group: "In the water", item: "Snorkel gear, no charge", sortOrder: 2 },
    ],
  });

  // Activities existed only for Maafushi and Dhigurah, so Thulusdhoo's suggestions
  // section would have dropped. These give it two.
  const surf = await db.activity.upsert({
    where: { slug: "cokes-and-chickens-surf-session" },
    update: {},
    create: {
      name: "Cokes and Chickens surf session",
      slug: "cokes-and-chickens-surf-session",
      category: "WATER_SPORTS",
      locationId: thulusdhoo.id,
      shortDesc: "A dhoni out to the two named breaks off the reef, timed to the tide.",
      description:
        "Cokes is fast, shallow and unforgiving; Chickens is longer and more forgiving of a late drop. Which one you get depends on the swell and the tide, and the boat goes when the conditions say so rather than at a set hour. Boards can be hired if you did not bring one.",
      internationalPrice: 45,
      isActive: true,
      sortOrder: 0,
    },
  });

  const drift = await db.activity.upsert({
    where: { slug: "thulusdhoo-reef-drift" },
    update: {},
    create: {
      name: "Reef drift snorkel",
      slug: "thulusdhoo-reef-drift",
      category: "SNORKELING",
      locationId: thulusdhoo.id,
      shortDesc: "Drop in up-current and let the channel carry you along the reef edge.",
      description:
        "A guided drift along the outside of the reef, where the channel pushes you past the coral without any swimming to speak of. Turtles are common and the occasional eagle ray passes through. Flat-water mornings only.",
      internationalPrice: 35,
      isActive: true,
      sortOrder: 1,
    },
  });

  // ---- 2. The two missing packages.
  const packages = [
    {
      slug: "thulusdhoo-surf-week",
      name: "Six nights on the surf island",
      locationId: thulusdhoo.id,
      accommodationId: lodge.id,
      coverImage: "thulusdhoo-surf.jpg",
      minNights: 6,
      maxNights: 10,
      maxGuests: 2,
      badge: "Surfers",
      mealPlan: "Breakfast daily",
      boardBasis: "BED_AND_BREAKFAST" as const,
      bestMonths: "April to October",
      shortDesc:
        "Two named breaks off the reef, a board rack by the door, and a speedboat that takes forty-five minutes.",
      description:
        "Thulusdhoo is a working local island that happens to sit beside two of the best waves in the country. You stay in a guesthouse, eat where the island eats, and go out on a dhoni when the tide is right.",
      longBlurb:
        "The swell runs from April to October and the island fills with people who came for it. Between sessions there is very little to do beyond a reef to snorkel and a harbour wall to sit on, and after a week most people decide that was the correct amount of structure.\n\nA speedboat gets you here in forty-five minutes, which is the shortest transfer of anything we sell outside North Malé. No seaplane bill, no overnight in the capital.",
      inclusions: [
        { category: "ACCOMMODATION" as const, item: "Six nights, sea-view double" },
        { category: "MEALS" as const, item: "Breakfast daily" },
        { category: "TRANSFER" as const, item: "Return speedboat from Malé", details: "45 minutes each way" },
        { category: "ACTIVITY" as const, item: "Three guided surf sessions" },
        { category: "EQUIPMENT" as const, item: "Board storage and snorkel gear" },
      ],
      activities: [
        { id: surf.id, isIncluded: true, note: "Three sessions across the week, tide permitting." },
        { id: drift.id, isIncluded: false, note: null },
      ],
      pricing: { base: 780, couple: 1180 },
      tags: ["surfing"],
      faqs: [
        {
          question: "Do I need to bring a board?",
          answer:
            "No, the lodge hires them and keeps a reasonable range of shortboards and one longboard. Bring your own if you are particular about volume — the hire boards are serviceable rather than good.",
        },
        {
          question: "What if there is no swell?",
          answer:
            "It happens, and we will not pretend otherwise. April to October is the reliable half of the year, but a flat week is possible. The reef drift and the snorkelling run regardless.",
        },
      ],
    },
    {
      slug: "kaani-beach-and-sandbank",
      name: "Beach road, five nights and a sandbank",
      locationId: maafushi.id,
      accommodationId: kaani.id,
      coverImage: "kaani-sandbank.jpg",
      minNights: 5,
      maxNights: 8,
      maxGuests: 3,
      badge: "Best value",
      mealPlan: "Breakfast daily",
      boardBasis: "BED_AND_BREAKFAST" as const,
      bestMonths: "Year round",
      shortDesc:
        "The quiet end of Maafushi's beach road, with the bikini beach two minutes away and a sandbank afternoon in the price.",
      description:
        "A family-run hotel at the far end of the beach road, far enough from the harbour to be quiet. Breakfast is the best on the island by a clear margin.",
      longBlurb:
        "Maafushi is the local island that got good at hosting, and Kaani sits at the end of it where the guesthouses thin out. The bikini beach is a two-minute walk, the boats leave all morning, and there is no seaplane bill attached to any of it.\n\nThe sandbank afternoon is the thing people remember: a dhoni drops you on a strip of sand with nobody else on it and comes back when you wave.",
      inclusions: [
        { category: "ACCOMMODATION" as const, item: "Five nights, sea-view room" },
        { category: "MEALS" as const, item: "Breakfast daily" },
        { category: "TRANSFER" as const, item: "Return speedboat from Malé", details: "30 minutes each way" },
        { category: "ACTIVITY" as const, item: "Sandbank afternoon with snorkelling" },
        { category: "EQUIPMENT" as const, item: "Snorkel gear for the stay" },
      ],
      activities: [
        { slug: "sandbank-picnic", isIncluded: true, note: "One afternoon, with the boat coming back for you." },
        { slug: "sunset-dolphin-cruise", isIncluded: false, note: null },
        { slug: "discover-scuba-diving", isIncluded: false, note: null },
      ],
      pricing: { base: 720, couple: 1090 },
      tags: ["family"],
      faqs: [
        {
          question: "Is there a bikini beach?",
          answer:
            "Yes, two minutes along the sand. Maafushi is an inhabited island, so swimwear belongs on that stretch rather than on the village beach or the streets.",
        },
        {
          question: "Can we add a resort day trip?",
          answer:
            "Usually. Several nearby resorts sell day passes and we can arrange one against your dates — it is quoted separately rather than bundled, because the prices move.",
        },
      ],
    },
  ];

  for (const [i, p] of packages.entries()) {
    const created = await db.package.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        shortDesc: p.shortDesc,
        description: p.description,
        longBlurb: p.longBlurb,
        locationId: p.locationId,
        accommodationId: p.accommodationId,
        coverImage: p.coverImage,
        minNights: p.minNights,
        maxNights: p.maxNights,
        maxGuests: p.maxGuests,
        badge: p.badge,
        mealPlan: p.mealPlan,
        boardBasis: p.boardBasis,
        bestMonths: p.bestMonths,
        // Deliberately not featured: Home shows the four featured packages, the
        // listing shows all seven. That difference is worth having in the data.
        isFeatured: false,
        isActive: true,
        sortOrder: 10 + i,
      },
    });

    await db.packagePricing.deleteMany({ where: { packageId: created.id } });
    await db.packagePricing.createMany({
      data: [
        {
          packageId: created.id,
          market: "INTERNATIONAL",
          basePrice: p.pricing.base,
          couplePrice: p.pricing.couple,
        },
        {
          packageId: created.id,
          market: "LOCAL",
          basePrice: MVR(p.pricing.base),
          couplePrice: MVR(p.pricing.couple),
        },
      ],
    });

    await db.packageInclusion.deleteMany({ where: { packageId: created.id } });
    await db.packageInclusion.createMany({
      data: p.inclusions.map((inc, idx) => ({
        packageId: created.id,
        category: inc.category,
        item: inc.item,
        details: "details" in inc ? (inc.details as string) : null,
        sortOrder: idx,
      })),
    });

    await db.packageActivity.deleteMany({ where: { packageId: created.id } });
    for (const [idx, a] of p.activities.entries()) {
      const activityId =
        "id" in a
          ? (a.id as string)
          : (await db.activity.findUnique({ where: { slug: a.slug as string } }))?.id;
      if (!activityId) continue;
      await db.packageActivity.create({
        data: {
          packageId: created.id,
          activityId,
          isIncluded: a.isIncluded,
          note: a.note,
          sortOrder: a.isIncluded ? idx : 10 + idx,
        },
      });
    }

    await db.faqItem.deleteMany({ where: { packageId: created.id } });
    await db.faqItem.createMany({
      data: p.faqs.map((f, idx) => ({
        packageId: created.id,
        question: f.question,
        answer: f.answer,
        sortOrder: idx,
      })),
    });
  }

  // ---- 3. Tag the whole catalogue so the listing's filter bar can actually filter.
  const surfTag = await db.tag.upsert({
    where: { slug: "surfing" },
    update: {},
    create: { name: "Surfing", slug: "surfing", sortOrder: 3 },
  });

  const TAGGING: Record<string, string[]> = {
    "maafushi-beach-getaway": ["family"],
    "whale-shark-explorer": ["diving"],
    "baros-romantic-escape": ["honeymoon"],
    "soneva-fushi-family-paradise": ["family", "honeymoon"],
    "fulidhoo-shark-safari": ["diving"],
    "thulusdhoo-surf-week": ["surfing"],
    "kaani-beach-and-sandbank": ["family"],
  };

  const tags = await db.tag.findMany();
  for (const [slug, tagSlugs] of Object.entries(TAGGING)) {
    const pkg = await db.package.findUnique({ where: { slug } });
    if (!pkg) continue;
    await db.packageTag.deleteMany({ where: { packageId: pkg.id } });
    await db.packageTag.createMany({
      data: tagSlugs
        .map((ts) => tags.find((t) => t.slug === ts)?.id)
        .filter((id): id is string => Boolean(id))
        .map((tagId) => ({ packageId: pkg.id, tagId })),
    });
  }
  void surfTag;

  // ---- 4. Link the stay types each island actually offers.
  const stayTypes = await db.stayType.findMany();
  const byLocation: Record<string, { slug: string; nightlyFrom?: number }[]> = {
    maafushi: [{ slug: "guesthouse", nightlyFrom: 95 }, { slug: "beach-villa" }],
    thulusdhoo: [{ slug: "guesthouse", nightlyFrom: 65 }],
    dhigurah: [{ slug: "guesthouse", nightlyFrom: 80 }, { slug: "dive-lodge" }],
    fulidhoo: [{ slug: "guesthouse", nightlyFrom: 70 }, { slug: "dive-lodge" }],
    baros: [{ slug: "water-villa" }, { slug: "beach-villa" }],
    "soneva-fushi": [{ slug: "water-villa", nightlyFrom: 950 }, { slug: "beach-villa", nightlyFrom: 700 }],
  };

  for (const [locSlug, rows] of Object.entries(byLocation)) {
    const loc = await db.location.findUnique({ where: { slug: locSlug } });
    if (!loc) continue;
    await db.locationStayType.deleteMany({ where: { locationId: loc.id } });
    await db.locationStayType.createMany({
      data: rows
        .map((r, idx) => {
          const st = stayTypes.find((s) => s.slug === r.slug);
          if (!st) return null;
          return {
            locationId: loc.id,
            stayTypeId: st.id,
            nightlyFrom: r.nightlyFrom ?? null,
            sortOrder: idx,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null),
    });
  }
}

main()
  .then(async () => {
    // ---- Integrity report. These are the invariants the schema cannot express.
    const orphanStays = await db.accommodation.findMany({
      where: { isActive: true, packages: { none: {} } },
      select: { name: true },
    });
    const emptyLocations = await db.location.findMany({
      where: { isActive: true, packages: { none: {} } },
      select: { name: true },
    });
    const mismatched = await db.$queryRaw<{ package: string }[]>`
      SELECT p.name AS \`package\` FROM Package p
      JOIN Accommodation a ON a.id = p.accommodationId
      WHERE a.locationId <> p.locationId`;

    console.log("packages:", await db.package.count({ where: { isActive: true } }));
    console.log("accommodations:", await db.accommodation.count({ where: { isActive: true } }));
    console.log("locations:", await db.location.count({ where: { isActive: true } }));
    console.log("stays in no package:", orphanStays.map((s) => s.name).join(", ") || "none");
    console.log("locations with no package:", emptyLocations.map((l) => l.name).join(", ") || "none");
    console.log("accommodation on wrong island:", mismatched.map((m) => m.package).join(", ") || "none");
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
