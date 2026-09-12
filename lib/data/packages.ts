// lib/db/packages.ts
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import type {
  Package,
  Location,
  Accommodation,
  PackagePricing,
  Offer,
  Market,
  AccommodationType,
} from "@prisma/client";
import {
  computePackagePrice,
  selectPricingRow,
  type PackagePrice,
  type PricingRow,
} from "@/lib/design/pricing";
import {
  lifecycleOf,
  opensLabel,
  type Blackout,
  type PackageLifecycle,
} from "@/lib/design/availability";
import { isPhotoRich } from "@/lib/design/density";
import {
  accommodationTypeLabel,
  packageEyebrow,
  transferSummary,
} from "@/lib/design/labels";

// Type for package with all relations
export type PackageWithRelations = Package & {
  location: Pick<
    Location,
    "id" | "name" | "atoll" | "slug" | "transferTime" | "transferType"
  >;
  accommodation: Pick<Accommodation, "id" | "name" | "type">;
  pricing: PackagePricing[];
  offers: Array<Pick<Offer, "id" | "badge" | "discountType" | "discountValue">>;
  _count: {
    activities: number;
  };
};

// Type for full package details page
// `highlights` is a JSON column (MySQL); expose it as string[].
export type PackageDetails = Omit<Package, "highlights"> & {
  highlights: string[];
  location: Location;
  accommodation: Accommodation;
  pricing: PackagePricing[];
  inclusions: Array<{
    id: string;
    category: string;
    item: string;
    details: string | null;
    sortOrder: number;
  }>;
  // Suggestions, not a schedule: Island Hype sells fixed packages and does not
  // commit to a daily itinerary. `isIncluded` separates what is in the price
  // from optional add-ons; `note` is optional package-specific copy.
  activities: Array<{
    activity: {
      id: string;
      name: string;
      slug: string;
      shortDesc: string | null;
      description: string | null;
      duration: number | null;
      category: string;
    };
    isIncluded: boolean;
    note: string | null;
    sortOrder: number;
  }>;
  offers: Offer[];
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
  }>;
};

// Filter interface
export interface PackageFilters {
  location?: string;
  accommodationType?: string;
  minPrice?: number;
  maxPrice?: number;
  minNights?: number;
  maxNights?: number;
  search?: string;
}

// Sort options
export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "nights-asc"
  | "nights-desc"
  | "name-asc";

// Filter options type
export interface FilterOptions {
  locations: Array<{
    id: string;
    name: string;
    slug: string;
    atoll: string;
    _count: {
      packages: number;
    };
  }>;
  accommodationTypes: AccommodationType[];
}

/**
 * Fetch packages with filters and sorting
 */
async function getPackagesQuery(
  filters: PackageFilters = {},
  sort: SortOption = "featured",
  market: Market = "INTERNATIONAL"
): Promise<PackageWithRelations[]> {
  const {
    location,
    accommodationType,
    minPrice,
    maxPrice,
    minNights,
    maxNights,
    search,
  } = filters;

  // Build where clause with proper Prisma types
  const where: Prisma.PackageWhereInput = {
    isActive: true,
  };

  // Filter by location
  if (location) {
    where.location = {
      slug: location,
    };
  }

  // Filter by accommodation type
  if (accommodationType) {
    where.accommodation = {
      type: accommodationType as AccommodationType,
    };
  }

  // Filter by nights
  if (minNights !== undefined) {
    where.minNights = {
      gte: minNights,
    };
  }

  if (maxNights !== undefined) {
    where.minNights = {
      ...(where.minNights as Prisma.IntFilter),
      lte: maxNights,
    };
  }

  // Filter by price
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: Prisma.PackagePricingWhereInput = {
      market,
    };

    if (minPrice !== undefined) {
      priceCondition.couplePrice = { gte: minPrice };
    }

    if (maxPrice !== undefined) {
      priceCondition.couplePrice = {
        ...(priceCondition.couplePrice as Prisma.FloatFilter),
        lte: maxPrice,
      };
    }

    where.pricing = {
      some: priceCondition,
    };
  }

  // Search in name, shortDesc, location name
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { shortDesc: { contains: search } },
      { location: { name: { contains: search } } },
    ];
  }

  // Build orderBy with proper Prisma types
  let orderBy:
    | Prisma.PackageOrderByWithRelationInput
    | Prisma.PackageOrderByWithRelationInput[];

  switch (sort) {
    case "featured":
      orderBy = [{ isFeatured: "desc" }, { sortOrder: "asc" }];
      break;
    case "price-asc":
    case "price-desc":
      orderBy = { name: "asc" }; // Will sort by price client-side
      break;
    case "nights-asc":
      orderBy = { minNights: "asc" };
      break;
    case "nights-desc":
      orderBy = { minNights: "desc" };
      break;
    case "name-asc":
      orderBy = { name: "asc" };
      break;
    default:
      orderBy = [{ isFeatured: "desc" }, { sortOrder: "asc" }];
  }

  const packages = await prisma.package.findMany({
    where,
    orderBy,
    include: {
      location: {
        select: {
          id: true,
          name: true,
          atoll: true,
          slug: true,
          transferTime: true,
          transferType: true,
        },
      },
      accommodation: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      pricing: {
        where: {
          market,
        },
      },
      offers: {
        where: {
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
        },
        select: {
          id: true,
          badge: true,
          discountType: true,
          discountValue: true,
        },
      },
      _count: {
        select: {
          activities: true,
        },
      },
    },
  });

  // Sort by price if needed (client-side)
  if (sort === "price-asc" || sort === "price-desc") {
    packages.sort((a, b) => {
      const aPrice = a.pricing[0]?.couplePrice || 0;
      const bPrice = b.pricing[0]?.couplePrice || 0;
      return sort === "price-asc" ? aPrice - bPrice : bPrice - aPrice;
    });
  }

  return packages as PackageWithRelations[];
}

const getPackagesCached = unstable_cache(
  async (filters: PackageFilters, sort: SortOption, market: Market) =>
    getPackagesQuery(filters, sort, market),
  ["packages:list"],
  { revalidate: 30 }
);

export async function getPackages(
  filters: PackageFilters = {},
  sort: SortOption = "featured",
  market: Market = "INTERNATIONAL"
): Promise<PackageWithRelations[]> {
  return getPackagesCached(filters, sort, market);
}

/**
 * Get unique filter options
 */
async function getFilterOptionsQuery(): Promise<FilterOptions> {
  const [locations, accommodationTypes] = await Promise.all([
    prisma.location.findMany({
      where: {
        packages: {
          some: {
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        atoll: true,
        _count: {
          select: {
            packages: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.accommodation.findMany({
      where: {
        packages: {
          some: {
            isActive: true,
          },
        },
      },
      select: {
        type: true,
      },
      distinct: ["type"],
    }),
  ]);

  return {
    locations,
    accommodationTypes: accommodationTypes.map((a) => a.type),
  };
}

const getFilterOptionsCached = unstable_cache(
  async () => getFilterOptionsQuery(),
  ["packages:filter-options"],
  { revalidate: 300 }
);

export async function getFilterOptions(): Promise<FilterOptions> {
  return getFilterOptionsCached();
}

/**
 * Get package details by slug for details page
 */
export async function getPackageBySlug(
  slug: string,
  market: Market = "INTERNATIONAL"
): Promise<PackageDetails | null> {
  const pkg = await prisma.package.findUnique({
    where: {
      slug,
      isActive: true,
    },
    include: {
      location: true,
      accommodation: true,
      pricing: {
        where: {
          market,
        },
      },
      inclusions: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      activities: {
        include: {
          activity: {
            select: {
              id: true,
              name: true,
              slug: true,
              shortDesc: true,
              description: true,
              duration: true,
              category: true,
            },
          },
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
      offers: {
        where: {
          validFrom: {
            lte: new Date(),
          },
          validUntil: {
            gte: new Date(),
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  return pkg as PackageDetails | null;
}

// ============================================================================
// Redesign loaders — one query shape per page.
//
// These return exactly what a page renders: display strings are built here, not
// in components, and every layout-affecting fact (photoRich, lifecycle, price) is
// derived at this boundary. Components stay dumb, which is what keeps the density
// rules honest — a component cannot accidentally read `minNights` and print
// "4+ nights", because it never sees it.
//
// The pre-redesign exports above are still used by the old pages and are removed
// in Phase 4 of docs/superpowers/plans/2026-09-12-public-site-revamp.md.
// ============================================================================

/** A package as every card form needs it. */
export interface PackageCard {
  id: string;
  slug: string;
  name: string;
  blurb: string | null;
  /** "Baa Atoll · 4 nights" */
  eyebrow: string;
  atoll: string;
  locationName: string;
  locationSlug: string;
  /** The sold length. `minNights` never leaves this module. */
  nights: number;
  stay: string | null;
  transfer: string | null;
  mealPlan: string | null;
  badge: string | null;
  coverImage: string | null;
  photoRich: boolean;
  price: PackagePrice | null;
  lifecycle: PackageLifecycle;
  /** "From March 2027", for an upcoming package. */
  opens: string | null;
  tags: string[];
}

const cardSelect = {
  id: true,
  slug: true,
  name: true,
  shortDesc: true,
  minNights: true,
  mealPlan: true,
  badge: true,
  coverImage: true,
  isFeatured: true,
  sortOrder: true,
  travelWindowStart: true,
  travelWindowEnd: true,
  bookingWindowStart: true,
  bookingWindowEnd: true,
  location: {
    select: { name: true, slug: true, atoll: true, transferType: true, transferTime: true },
  },
  accommodation: { select: { name: true, type: true } },
  pricing: true,
  images: { select: { url: true }, take: 1 },
  tags: { select: { tag: { select: { name: true, slug: true } } } },
} as const;

type CardRow = {
  id: string;
  slug: string;
  name: string;
  shortDesc: string | null;
  minNights: number;
  mealPlan: string | null;
  badge: string | null;
  coverImage: string | null;
  isFeatured: boolean;
  sortOrder: number;
  travelWindowStart: Date | null;
  travelWindowEnd: Date | null;
  bookingWindowStart: Date | null;
  bookingWindowEnd: Date | null;
  location: {
    name: string;
    slug: string;
    atoll: string;
    transferType: Location["transferType"];
    transferTime: number | null;
  };
  accommodation: { name: string; type: AccommodationType };
  pricing: PackagePricing[];
  images: { url: string }[];
  tags: { tag: { name: string; slug: string } }[];
};

function toCard(row: CardRow, market: Market): PackageCard {
  const travel = { start: row.travelWindowStart, end: row.travelWindowEnd };
  const booking = { start: row.bookingWindowStart, end: row.bookingWindowEnd };
  const pricingRow = selectPricingRow(row.pricing as PricingRow[], market);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    blurb: row.shortDesc,
    eyebrow: packageEyebrow(row.location.atoll, row.minNights),
    atoll: row.location.atoll,
    locationName: row.location.name,
    locationSlug: row.location.slug,
    nights: row.minNights,
    stay: `${row.accommodation.name}, ${accommodationTypeLabel(row.accommodation.type).toLowerCase()}`,
    transfer: transferSummary(row.location.transferType, row.location.transferTime),
    mealPlan: row.mealPlan,
    badge: row.badge,
    coverImage: row.coverImage,
    photoRich: isPhotoRich({ coverImage: row.coverImage, images: row.images }),
    price: pricingRow ? computePackagePrice(pricingRow, { adults: 2, market }) : null,
    lifecycle: lifecycleOf({ travel, booking }),
    opens: opensLabel(travel, booking),
    tags: row.tags.map((t) => t.tag.slug),
  };
}

const LIFECYCLE_ORDER: Record<PackageLifecycle, number> = {
  open: 0,
  upcoming: 1,
  ended: 2,
};

/**
 * Cards for Home, the listing, and "packages here" on a location.
 *
 * Ended packages sort last rather than disappearing: the URL stays alive for
 * inbound links, and the card greys out instead. They are excluded from the
 * density count by `openCount`, so a catalogue of two live and three dead
 * packages still renders as rows, not a grid.
 */
export async function getPackageCards(opts: {
  featuredOnly?: boolean;
  locationSlug?: string;
  excludeSlug?: string;
  tagSlug?: string;
  market?: Market;
  includeEnded?: boolean;
} = {}): Promise<PackageCard[]> {
  const market = opts.market ?? "INTERNATIONAL";

  const rows = (await prisma.package.findMany({
    where: {
      isActive: true,
      ...(opts.featuredOnly ? { isFeatured: true } : {}),
      ...(opts.locationSlug ? { location: { slug: opts.locationSlug } } : {}),
      ...(opts.excludeSlug ? { slug: { not: opts.excludeSlug } } : {}),
      ...(opts.tagSlug ? { tags: { some: { tag: { slug: opts.tagSlug } } } } : {}),
    },
    select: cardSelect,
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
  })) as unknown as CardRow[];

  const cards = rows.map((r) => toCard(r, market));
  const visible = opts.includeEnded === false
    ? cards.filter((c) => c.lifecycle !== "ended")
    : cards;

  return visible.sort(
    (a, b) => LIFECYCLE_ORDER[a.lifecycle] - LIFECYCLE_ORDER[b.lifecycle]
  );
}

/** What drives every density threshold: live packages only. */
export function openCount(cards: PackageCard[]): number {
  return cards.filter((c) => c.lifecycle !== "ended").length;
}

export interface PackageSuggestion {
  id: string;
  name: string;
  slug: string;
  /** The package-specific note when set, otherwise the activity's own blurb. */
  body: string | null;
  isIncluded: boolean;
}

export interface PackageDetail extends PackageCard {
  longBlurb: string | null;
  bestMonths: string | null;
  minNights: number;
  maxNights: number | null;
  images: { id: string; url: string; alt: string | null }[];
  included: string[];
  location: Location;
  accommodation: Accommodation;
  /** Suggestions, not a schedule. Empty means the section does not render. */
  suggestions: PackageSuggestion[];
  faqs: { id: string; question: string; answer: string }[];
  blackouts: Blackout[];
  relatedCount: number;
}

export async function getPackageDetail(
  slug: string,
  market: Market = "INTERNATIONAL"
): Promise<PackageDetail | null> {
  const row = await prisma.package.findUnique({
    where: { slug },
    include: {
      location: true,
      accommodation: true,
      pricing: true,
      images: { orderBy: { sortOrder: "asc" } },
      inclusions: { orderBy: { sortOrder: "asc" } },
      activities: {
        include: { activity: { select: { id: true, name: true, slug: true, shortDesc: true } } },
        orderBy: { sortOrder: "asc" },
      },
      faqs: { orderBy: { sortOrder: "asc" } },
      blackouts: { orderBy: { startDate: "asc" } },
      tags: { select: { tag: { select: { name: true, slug: true } } } },
    },
  });
  if (!row || !row.isActive) return null;

  const card = toCard(
    {
      ...row,
      location: {
        name: row.location.name,
        slug: row.location.slug,
        atoll: row.location.atoll,
        transferType: row.location.transferType,
        transferTime: row.location.transferTime,
      },
      accommodation: { name: row.accommodation.name, type: row.accommodation.type },
      images: row.images.map((i) => ({ url: i.url })),
    } as unknown as CardRow,
    market
  );

  const relatedCount = await prisma.package.count({
    where: { isActive: true, slug: { not: slug } },
  });

  return {
    ...card,
    longBlurb: row.longBlurb,
    bestMonths: row.bestMonths,
    minNights: row.minNights,
    maxNights: row.maxNights,
    images: row.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })),
    included: row.inclusions.map((i) => i.details ? `${i.item} — ${i.details}` : i.item),
    location: row.location,
    accommodation: row.accommodation,
    suggestions: row.activities.map((a) => ({
      id: a.activity.id,
      name: a.activity.name,
      slug: a.activity.slug,
      body: a.note ?? a.activity.shortDesc,
      isIncluded: a.isIncluded,
    })),
    faqs: row.faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
    blackouts: row.blackouts.map((b) => ({
      startDate: b.startDate,
      endDate: b.endDate,
      reason: b.reason,
    })),
    relatedCount,
  };
}

export interface PackageFilterOptions {
  tags: { name: string; slug: string; count: number }[];
  locations: { name: string; slug: string; count: number }[];
}

export async function getPackageFilterOptions(): Promise<PackageFilterOptions> {
  const [tags, locations] = await Promise.all([
    prisma.tag.findMany({
      where: { packages: { some: { package: { isActive: true } } } },
      select: { name: true, slug: true, _count: { select: { packages: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.location.findMany({
      where: { isActive: true, packages: { some: { isActive: true } } },
      select: { name: true, slug: true, _count: { select: { packages: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    tags: tags.map((t) => ({ name: t.name, slug: t.slug, count: t._count.packages })),
    locations: locations.map((l) => ({ name: l.name, slug: l.slug, count: l._count.packages })),
  };
}
