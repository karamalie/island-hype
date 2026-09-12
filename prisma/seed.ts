// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data (in correct order due to foreign keys)
  // This wipes every table before reseeding. That was harmless when the only
  // data was demo fixtures; it is not harmless now that local development runs
  // against a clone of production. So it refuses unless you say so explicitly.
  if (process.env.ALLOW_DESTRUCTIVE_SEED !== "1") {
    console.error(
      [
        "",
        "Refusing to run: this seed deletes every row in every table first.",
        "",
        "If you actually want that — a genuinely empty database — run:",
        "  ALLOW_DESTRUCTIVE_SEED=1 npm run db:seed",
        "",
        "If you wanted real content, you almost certainly want one of:",
        "  npm run db:fix-associations   packages, stays and their links",
        "  npm run db:seed-locations     island character and season calendars",
        "",
      ].join("\n")
    );
    process.exit(1);
  }

  await prisma.inquiry.deleteMany();
  await prisma.packageImage.deleteMany();
  await prisma.packageActivity.deleteMany();
  await prisma.packageInclusion.deleteMany();
  await prisma.packagePricing.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.package.deleteMany();
  await prisma.activityImage.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.accommodationImage.deleteMany();
  await prisma.accommodation.deleteMany();
  await prisma.locationImage.deleteMany();
  await prisma.location.deleteMany();

  console.log("🧹 Cleaned existing data");

  // ============================================
  // EXPERIENCES
  // ============================================


  // ============================================
  // LOCATIONS
  // ============================================
  // Images go in: locations bucket
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: "Maafushi",
        slug: "maafushi",
        atoll: "Kaafu Atoll",
        shortDesc:
          "The most popular local island, known for water sports and vibrant beach life.",
        description:
          "Maafushi is the Maldives' most visited local island, located just 27km from Malé. It offers an authentic Maldivian experience with guesthouses, restaurants, and easy access to nearby resorts and dive sites. Perfect for budget-conscious travelers who still want paradise.",
        coverImage: "maafushi.jpg",
        latitude: 3.9419,
        longitude: 73.4909,
        transferTime: 30,
        transferType: "SPEEDBOAT",
        isFeatured: true,
      },
    }),
    prisma.location.create({
      data: {
        name: "Thulusdhoo",
        slug: "thulusdhoo",
        atoll: "Kaafu Atoll",
        shortDesc:
          "Famous for world-class surfing and the original Coca-Cola factory.",
        description:
          "Thulusdhoo is a surfer's paradise with consistent waves at 'Cokes' and 'Chickens' breaks. Beyond surfing, it's a charming local island with a fascinating history as home to the Maldives' first Coca-Cola bottling plant.",
        coverImage: "thulusdhoo.jpg",
        latitude: 4.3747,
        longitude: 73.6492,
        transferTime: 45,
        transferType: "SPEEDBOAT",
        isFeatured: false,
      },
    }),
    prisma.location.create({
      data: {
        name: "Fulidhoo",
        slug: "fulidhoo",
        atoll: "Vaavu Atoll",
        shortDesc: "A tiny island paradise famous for nurse shark encounters.",
        description:
          "Fulidhoo is a small, peaceful island in Vaavu Atoll. It's famous for the nurse shark point where you can snorkel with dozens of gentle nurse sharks. The island offers an escape from crowds with pristine beaches.",
        coverImage: "fulidhoo.jpg",
        latitude: 3.5917,
        longitude: 73.4342,
        transferTime: 90,
        transferType: "SPEEDBOAT",
        isFeatured: true,
      },
    }),
    prisma.location.create({
      data: {
        name: "Dhigurah",
        slug: "dhigurah",
        atoll: "South Ari Atoll",
        shortDesc: "The whale shark capital with a stunning 3km long beach.",
        description:
          "Dhigurah is famous for year-round whale shark encounters at South Ari Marine Protected Area. The island features a spectacular 3km white sand beach - one of the longest in the Maldives. A must-visit for marine life enthusiasts.",
        coverImage: "dhigurah.jpg",
        latitude: 3.5136,
        longitude: 72.9281,
        transferTime: 120,
        transferType: "SPEEDBOAT",
        isFeatured: true,
      },
    }),
    prisma.location.create({
      data: {
        name: "Baros Island",
        slug: "baros",
        atoll: "North Malé Atoll",
        shortDesc: "Award-winning luxury resort with exceptional house reef.",
        description:
          "Baros Maldives is a multi-award-winning luxury resort just 25 minutes from the airport. Known for its exceptional house reef, intimate atmosphere, and classic Maldivian elegance. Perfect for honeymoons and romantic getaways.",
        coverImage: "baros.jpg",
        latitude: 4.2667,
        longitude: 73.4333,
        transferTime: 25,
        transferType: "SPEEDBOAT",
        isFeatured: true,
      },
    }),
    prisma.location.create({
      data: {
        name: "Soneva Fushi",
        slug: "soneva-fushi",
        atoll: "Baa Atoll",
        shortDesc: "Ultra-luxury eco-resort in a UNESCO Biosphere Reserve.",
        description:
          "Soneva Fushi pioneered barefoot luxury in the Maldives. Set within the UNESCO Baa Atoll Biosphere Reserve, it offers incredible marine biodiversity, an observatory, cinema, and the famous no-shoes policy.",
        coverImage: "soneva-fushi.jpg",
        latitude: 5.1128,
        longitude: 73.0697,
        transferTime: 30,
        transferType: "SEAPLANE",
        isFeatured: true,
      },
    }),
  ]);

  console.log(`✅ Created ${locations.length} locations`);

  // ============================================
  // ACCOMMODATIONS
  // ============================================
  // Images go in: accommodations bucket
  const accommodations = await Promise.all([
    prisma.accommodation.create({
      data: {
        name: "Arena Beach Hotel",
        slug: "arena-beach-hotel",
        type: "GUESTHOUSE",
        shortDesc: "Beachfront guesthouse with stunning sunset views.",
        description:
          "Arena Beach Hotel is one of Maafushi's premier guesthouses, located directly on the bikini beach. Enjoy modern rooms, a rooftop restaurant, and easy access to water sports.",
        coverImage: "arena-beach.jpg",
        starRating: 4,
        locationId: locations[0].id,
      },
    }),
    prisma.accommodation.create({
      data: {
        name: "Kaani Beach Hotel",
        slug: "kaani-beach-hotel",
        type: "GUESTHOUSE",
        shortDesc: "Modern comfort meets Maldivian hospitality.",
        description:
          "Kaani Beach Hotel offers contemporary rooms with ocean views, an infinity pool, and excellent dining. Located at the quieter end of Maafushi.",
        coverImage: "kaani-beach.jpg",
        starRating: 4,
        locationId: locations[0].id,
      },
    }),
    prisma.accommodation.create({
      data: {
        name: "Thundi Guesthouse",
        slug: "thundi-guesthouse",
        type: "GUESTHOUSE",
        shortDesc: "Cozy island retreat steps from the beach.",
        description:
          "Thundi Guesthouse offers a warm, family-run experience on peaceful Fulidhoo. Simple but comfortable rooms and home-cooked Maldivian meals.",
        coverImage: "thundi.jpg",
        starRating: 3,
        locationId: locations[2].id,
      },
    }),
    prisma.accommodation.create({
      data: {
        name: "Dhigurah Beach View",
        slug: "dhigurah-beach-view",
        type: "GUESTHOUSE",
        shortDesc: "Direct access to the famous 3km beach.",
        description:
          "Wake up to stunning beach views at this comfortable guesthouse. Perfect base for whale shark excursions with PADI dive center on-site.",
        coverImage: "dhigurah-beach-view.jpg",
        starRating: 3,
        locationId: locations[3].id,
      },
    }),
    prisma.accommodation.create({
      data: {
        name: "Baros Maldives",
        slug: "baros-maldives-resort",
        type: "RESORT",
        shortDesc: "Iconic luxury resort with world-class service.",
        description:
          "Baros Maldives features elegant water villas, overwater spa, fine dining restaurants, and one of the best house reefs in the Maldives. A true barefoot luxury experience.",
        coverImage: "baros-resort.jpg",
        starRating: 5,
        locationId: locations[4].id,
      },
    }),
    prisma.accommodation.create({
      data: {
        name: "Soneva Fushi Resort",
        slug: "soneva-fushi-resort",
        type: "RESORT",
        shortDesc: "Pioneering barefoot luxury in paradise.",
        description:
          "Soneva Fushi offers ultra-luxury villas with private pools, Butler service, and incredible experiences from stargazing to chocolate rooms. Sustainable luxury at its finest.",
        coverImage: "soneva-fushi-resort.jpg",
        starRating: 5,
        locationId: locations[5].id,
      },
    }),
  ]);

  console.log(`✅ Created ${accommodations.length} accommodations`);

  // ============================================
  // ACTIVITIES
  // ============================================
  // Images go in: activities bucket
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        name: "Whale Shark Excursion",
        slug: "whale-shark-excursion",
        category: "EXCURSION",
        shortDesc: "Swim with the gentle giants of the ocean.",
        description:
          "Join a guided snorkeling trip to encounter whale sharks in their natural habitat. These magnificent creatures can grow up to 12 meters long but are completely harmless.",
        coverImage: "whale-shark.jpg",
        duration: 180,
        localPrice: 1500,
        internationalPrice: 120,
        locationId: locations[3].id,
      },
    }),
    prisma.activity.create({
      data: {
        name: "Sunset Dolphin Cruise",
        slug: "sunset-dolphin-cruise",
        category: "EXCURSION",
        shortDesc: "Watch dolphins play as the sun sets.",
        description:
          "Cruise into the sunset while pods of spinner dolphins leap and play around your boat. Includes refreshments and photo opportunities.",
        coverImage: "dolphin-cruise.jpg",
        duration: 120,
        localPrice: 800,
        internationalPrice: 65,
        locationId: locations[0].id,
      },
    }),
    prisma.activity.create({
      data: {
        name: "Night Fishing",
        slug: "night-fishing",
        category: "EXCURSION",
        shortDesc: "Traditional Maldivian line fishing under the stars.",
        description:
          "Experience traditional Maldivian fishing at night. Catch red snapper, grouper, and more. Your catch can be prepared for dinner!",
        coverImage: "night-fishing.jpg",
        duration: 180,
        localPrice: 600,
        internationalPrice: 50,
        locationId: locations[0].id,
      },
    }),
    prisma.activity.create({
      data: {
        name: "Sandbank Picnic",
        slug: "sandbank-picnic",
        category: "EXCURSION",
        shortDesc: "Private lunch on a pristine sandbank.",
        description:
          "Be dropped off on a tiny sandbank surrounded by crystal clear water. Enjoy a BBQ lunch, snorkeling, and total privacy.",
        coverImage: "sandbank.jpg",
        duration: 240,
        localPrice: 1200,
        internationalPrice: 95,
        locationId: locations[0].id,
      },
    }),
    prisma.activity.create({
      data: {
        name: "Discover Scuba Diving",
        slug: "discover-scuba",
        category: "DIVING",
        shortDesc: "Your first underwater adventure.",
        description:
          "No certification needed! Learn the basics in a pool session then experience an actual reef dive accompanied by an instructor.",
        coverImage: "discover-scuba.jpg",
        duration: 180,
        localPrice: 1800,
        internationalPrice: 130,
        locationId: locations[0].id,
      },
    }),
    prisma.activity.create({
      data: {
        name: "Manta Ray Night Dive",
        slug: "manta-night-dive",
        category: "DIVING",
        shortDesc: "Watch mantas feed in the spotlight.",
        description:
          "An unforgettable night dive experience watching manta rays glide gracefully through spotlights as they feed on plankton.",
        coverImage: "manta-night.jpg",
        duration: 120,
        localPrice: 2500,
        internationalPrice: 180,
        locationId: locations[3].id,
      },
    }),
    prisma.activity.create({
      data: {
        name: "Jet Ski Safari",
        slug: "jet-ski-safari",
        category: "WATER_SPORTS",
        shortDesc: "Explore the atoll at high speed.",
        description:
          "Ride through channels and around islands on a guided jet ski tour. Stop for snorkeling at secret spots only locals know.",
        coverImage: "jet-ski.jpg",
        duration: 90,
        localPrice: 2000,
        internationalPrice: 150,
        locationId: locations[0].id,
      },
    }),
    prisma.activity.create({
      data: {
        name: "Parasailing",
        slug: "parasailing",
        category: "WATER_SPORTS",
        shortDesc: "Soar above the turquoise lagoon.",
        description:
          "Get a bird's eye view of the islands and reefs from 100 meters up. Safe, exciting, and great photo opportunities.",
        coverImage: "parasailing.jpg",
        duration: 30,
        localPrice: 1200,
        internationalPrice: 85,
        locationId: locations[0].id,
      },
    }),
    prisma.activity.create({
      data: {
        name: "Cooking Class",
        slug: "cooking-class",
        category: "CULTURAL",
        shortDesc: "Learn to cook traditional Maldivian dishes.",
        description:
          "Visit the local market, learn about Maldivian ingredients, then cook traditional dishes like mas huni and garudhiya with a local chef.",
        coverImage: "cooking.jpg",
        duration: 180,
        localPrice: 800,
        internationalPrice: 60,
        locationId: locations[0].id,
      },
    }),
    prisma.activity.create({
      data: {
        name: "Sunrise Yoga",
        slug: "sunrise-yoga",
        category: "WELLNESS",
        shortDesc: "Greet the day with beachfront yoga.",
        description:
          "Start your morning with a peaceful yoga session on the beach as the sun rises over the Indian Ocean.",
        coverImage: "yoga.jpg",
        duration: 60,
        localPrice: 400,
        internationalPrice: 30,
        locationId: locations[0].id,
      },
    }),
  ]);

  console.log(`✅ Created ${activities.length} activities`);

  // ============================================
  // PACKAGES
  // ============================================
  // Images go in: packages bucket

  const package1 = await prisma.package.create({
    data: {
      name: "Maafushi Beach Getaway",
      slug: "maafushi-beach-getaway",
      shortDesc:
        "Experience the best of local island life with water sports and island hopping.",
      description:
        "Discover why Maafushi is the most popular local island in the Maldives. This value-packed getaway combines beach relaxation, water sports, and authentic cultural experiences.",
      coverImage: "maafushi-getaway.jpg",
      minNights: 4,
      maxGuests: 4,
      isFeatured: true,
      isActive: true,
      locationId: locations[0].id,
      accommodationId: accommodations[0].id,
      pricing: {
        create: [
          {
            market: "LOCAL",
            basePrice: 8500,
            couplePrice: 12000,
            extraAdultPrice: 3500,
            childPrice: 2000,
            infantPrice: 0,
            singleSupplement: 2500,
          },
          {
            market: "INTERNATIONAL",
            basePrice: 599,
            couplePrice: 899,
            extraAdultPrice: 250,
            childPrice: 150,
            infantPrice: 0,
            singleSupplement: 180,
          },
        ],
      },
      inclusions: {
        create: [
          {
            category: "ACCOMMODATION",
            item: "4 nights beachfront room",
            sortOrder: 1,
          },
          { category: "MEALS", item: "Daily breakfast", sortOrder: 2 },
          {
            category: "TRANSFER",
            item: "Speedboat transfers from/to Malé",
            sortOrder: 3,
          },
          { category: "ACTIVITY", item: "Sunset dolphin cruise", sortOrder: 4 },
          { category: "ACTIVITY", item: "Sandbank picnic trip", sortOrder: 5 },
          { category: "ACTIVITY", item: "Snorkeling equipment", sortOrder: 6 },
        ],
      },
      activities: {
        create: [
          { activity: { connect: { id: activities[1].id } }, isIncluded: true },
          { activity: { connect: { id: activities[3].id } }, isIncluded: true },
          {
            activity: { connect: { id: activities[6].id } },
            isIncluded: false,
          },
          {
            activity: { connect: { id: activities[7].id } },
            isIncluded: false,
          },
        ],
      },
    },
  });

  const package2 = await prisma.package.create({
    data: {
      name: "Whale Shark Explorer",
      slug: "whale-shark-explorer",
      shortDesc:
        "Swim with whale sharks in the world's best destination for encounters.",
      description:
        "South Ari Atoll is the whale shark capital of the world. This package guarantees multiple whale shark excursions along with incredible diving and the beautiful 3km beach of Dhigurah.",
      coverImage: "whale-shark.jpg",
      minNights: 5,
      maxGuests: 6,
      isFeatured: true,
      isActive: true,
      locationId: locations[3].id,
      accommodationId: accommodations[3].id,
      pricing: {
        create: [
          {
            market: "LOCAL",
            basePrice: 12000,
            couplePrice: 18000,
            extraAdultPrice: 4500,
            childPrice: 2500,
            infantPrice: 0,
            singleSupplement: 3000,
          },
          {
            market: "INTERNATIONAL",
            basePrice: 849,
            couplePrice: 1299,
            extraAdultPrice: 320,
            childPrice: 180,
            infantPrice: 0,
            singleSupplement: 220,
          },
        ],
      },
      inclusions: {
        create: [
          {
            category: "ACCOMMODATION",
            item: "5 nights ocean view room",
            sortOrder: 1,
          },
          {
            category: "MEALS",
            item: "Full board (breakfast, lunch, dinner)",
            sortOrder: 2,
          },
          {
            category: "TRANSFER",
            item: "Speedboat transfers from/to Malé",
            sortOrder: 3,
          },
          {
            category: "ACTIVITY",
            item: "2 whale shark excursions",
            sortOrder: 4,
          },
          {
            category: "ACTIVITY",
            item: "1 manta point snorkeling trip",
            sortOrder: 5,
          },
          { category: "ACTIVITY", item: "Sunset cruise", sortOrder: 6 },
          {
            category: "EQUIPMENT",
            item: "Snorkeling equipment throughout stay",
            sortOrder: 7,
          },
        ],
      },
      activities: {
        create: [
          { activity: { connect: { id: activities[0].id } }, isIncluded: true },
          {
            activity: { connect: { id: activities[5].id } },
            isIncluded: false,
          },
        ],
      },
    },
  });

  const package3 = await prisma.package.create({
    data: {
      name: "Baros Romantic Escape",
      slug: "baros-romantic-escape",
      shortDesc: "Ultimate luxury honeymoon in an award-winning resort.",
      description:
        "Baros Maldives has been winning hearts (and awards) for over 50 years. This romantic package includes a water villa, private dining experiences, couples spa, and unforgettable moments.",
      coverImage: "baros-romance.jpg",
      minNights: 5,
      maxGuests: 2,
      isFeatured: true,
      isActive: true,
      locationId: locations[4].id,
      accommodationId: accommodations[4].id,
      pricing: {
        create: [
          {
            market: "LOCAL",
            basePrice: 85000,
            couplePrice: 85000,
            extraAdultPrice: 0,
            childPrice: 0,
            infantPrice: 0,
            singleSupplement: 25000,
          },
          {
            market: "INTERNATIONAL",
            basePrice: 5499,
            couplePrice: 5499,
            extraAdultPrice: 0,
            childPrice: 0,
            infantPrice: 0,
            singleSupplement: 1600,
          },
        ],
      },
      inclusions: {
        create: [
          {
            category: "ACCOMMODATION",
            item: "5 nights Water Villa with sundeck",
            sortOrder: 1,
          },
          {
            category: "MEALS",
            item: "Daily breakfast and dinner",
            sortOrder: 2,
          },
          {
            category: "TRANSFER",
            item: "Luxury speedboat transfers",
            sortOrder: 3,
          },
          {
            category: "ACTIVITY",
            item: "Sunset cruise with champagne",
            sortOrder: 4,
          },
          {
            category: "ACTIVITY",
            item: "Couples spa treatment (60 mins)",
            sortOrder: 5,
          },
          {
            category: "ACTIVITY",
            item: "Private sandbank dinner",
            sortOrder: 6,
          },
          {
            category: "SERVICE",
            item: "Romantic room decoration on arrival",
            sortOrder: 7,
          },
          {
            category: "SERVICE",
            item: "Honeymoon cake & sparkling wine",
            sortOrder: 8,
          },
        ],
      },
    },
  });

  const package4 = await prisma.package.create({
    data: {
      name: "Soneva Fushi Family Paradise",
      slug: "soneva-fushi-family-paradise",
      shortDesc:
        "Ultra-luxury family experience in a UNESCO Biosphere Reserve.",
      description:
        "The ultimate family vacation at the legendary Soneva Fushi. Kids will love The Den (kids club), chocolate room, observatory, and outdoor cinema. Parents will appreciate barefoot luxury and world-class service.",
      coverImage: "soneva-family.jpg",
      minNights: 6,
      maxGuests: 6,
      isFeatured: true,
      isActive: true,
      locationId: locations[5].id,
      accommodationId: accommodations[5].id,
      pricing: {
        create: [
          {
            market: "LOCAL",
            basePrice: 150000,
            couplePrice: 150000,
            extraAdultPrice: 35000,
            childPrice: 15000,
            infantPrice: 0,
            singleSupplement: 45000,
          },
          {
            market: "INTERNATIONAL",
            basePrice: 9999,
            couplePrice: 9999,
            extraAdultPrice: 2400,
            childPrice: 999,
            infantPrice: 0,
            singleSupplement: 3000,
          },
        ],
      },
      inclusions: {
        create: [
          {
            category: "ACCOMMODATION",
            item: "6 nights 2-Bedroom Villa with pool",
            sortOrder: 1,
          },
          {
            category: "MEALS",
            item: "Full board with all-day dining",
            sortOrder: 2,
          },
          {
            category: "TRANSFER",
            item: "Return seaplane transfers",
            sortOrder: 3,
          },
          {
            category: "ACTIVITY",
            item: "Daily kids club access (4-14 years)",
            sortOrder: 4,
          },
          { category: "ACTIVITY", item: "Family dolphin cruise", sortOrder: 5 },
          {
            category: "ACTIVITY",
            item: "Private movie screening",
            sortOrder: 6,
          },
          {
            category: "ACTIVITY",
            item: "Astronomy session at observatory",
            sortOrder: 7,
          },
          {
            category: "SERVICE",
            item: "Mr./Ms. Friday (personal butler)",
            sortOrder: 8,
          },
          {
            category: "EQUIPMENT",
            item: "Complimentary bicycles",
            sortOrder: 9,
          },
        ],
      },
    },
  });

  const package5 = await prisma.package.create({
    data: {
      name: "Fulidhoo Shark Safari",
      slug: "fulidhoo-shark-safari",
      shortDesc: "Snorkel with nurse sharks on a peaceful local island.",
      description:
        "Fulidhoo offers an incredible experience: snorkeling with dozens of nurse sharks at the famous shark point. Combined with the island's peaceful atmosphere, this is a unique Maldives adventure.",
      coverImage: "fulidhoo-sharks.jpg",
      minNights: 4,
      maxGuests: 4,
      isFeatured: false,
      isActive: true,
      locationId: locations[2].id,
      accommodationId: accommodations[2].id,
      pricing: {
        create: [
          {
            market: "LOCAL",
            basePrice: 7000,
            couplePrice: 10500,
            extraAdultPrice: 3000,
            childPrice: 1800,
            infantPrice: 0,
            singleSupplement: 2000,
          },
          {
            market: "INTERNATIONAL",
            basePrice: 499,
            couplePrice: 749,
            extraAdultPrice: 220,
            childPrice: 130,
            infantPrice: 0,
            singleSupplement: 150,
          },
        ],
      },
      inclusions: {
        create: [
          {
            category: "ACCOMMODATION",
            item: "4 nights beachfront room",
            sortOrder: 1,
          },
          {
            category: "MEALS",
            item: "Full board (home-cooked meals)",
            sortOrder: 2,
          },
          {
            category: "TRANSFER",
            item: "Speedboat transfers from/to Malé",
            sortOrder: 3,
          },
          {
            category: "ACTIVITY",
            item: "2 nurse shark point trips",
            sortOrder: 4,
          },
          { category: "ACTIVITY", item: "Sunset fishing trip", sortOrder: 5 },
          { category: "EQUIPMENT", item: "Snorkeling equipment", sortOrder: 6 },
        ],
      },
    },
  });

  console.log(`✅ Created 5 packages`);

  // ============================================
  // OFFERS
  // ============================================
  const offers = await Promise.all([
    prisma.offer.create({
      data: {
        name: "Early Bird 2026",
        slug: "early-bird-2026",
        description: "Book before March 31st for 15% off all packages.",
        discountType: "PERCENTAGE",
        discountValue: 15,
        code: "EARLY2026",
        validFrom: new Date("2026-01-01"),
        validUntil: new Date("2026-03-31"),
        minNights: 3,
        badge: "15% OFF",
        isActive: true,
        packageId: package1.id,
      },
    }),
    prisma.offer.create({
      data: {
        name: "Honeymoon Special",
        slug: "honeymoon-special",
        description:
          "Complimentary room upgrade and spa treatment for honeymooners.",
        discountType: "PERCENTAGE",
        discountValue: 10,
        validFrom: new Date("2026-01-01"),
        validUntil: new Date("2026-12-31"),
        minNights: 5,
        badge: "HONEYMOON",
        isActive: true,
        packageId: package3.id,
      },
    }),
    prisma.offer.create({
      data: {
        name: "Stay 5 Pay 4",
        slug: "stay-5-pay-4",
        description: "One night free when you book 5 nights.",
        discountType: "FREE_NIGHTS",
        discountValue: 1,
        validFrom: new Date("2026-02-01"),
        validUntil: new Date("2026-06-30"),
        minNights: 5,
        badge: "1 FREE NIGHT",
        isActive: true,
        packageId: package2.id,
      },
    }),
    prisma.offer.create({
      data: {
        name: "Family Deal",
        slug: "family-deal",
        description: "Kids under 12 stay and eat free!",
        discountType: "PERCENTAGE",
        discountValue: 100,
        validFrom: new Date("2026-01-01"),
        validUntil: new Date("2026-12-31"),
        minNights: 4,
        badge: "KIDS FREE",
        isActive: true,
        packageId: package4.id,
      },
    }),
  ]);

  console.log(`✅ Created ${offers.length} offers`);

  console.log("");
  console.log("🎉 Seed completed successfully!");
  console.log("");
  console.log("Summary:");
  console.log(`   - ${locations.length} Locations`);
  console.log(`   - ${accommodations.length} Accommodations`);
  console.log(`   - ${activities.length} Activities`);
  console.log(`   - 5 Packages`);
  console.log(`   - ${offers.length} Offers`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
