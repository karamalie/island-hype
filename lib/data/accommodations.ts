// lib/data/accommodations.ts
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import type {
  Accommodation,
  Location,
  AccommodationType,
  AccommodationImage,
  Package,
  PackagePricing,
} from "@prisma/client";
import { isPhotoRich } from "@/lib/design/density";
import { accommodationTypeLabel, transferSummary } from "@/lib/design/labels";
import { packagesLine } from "@/lib/design/inventory";

// `roomTypes`/`amenities` are JSON columns (MySQL); expose them as string[].
type AccommodationBase = Omit<Accommodation, "roomTypes" | "amenities"> & {
  roomTypes: string[];
  amenities: string[];
};

// Type for accommodation with relations (list view)
export type AccommodationWithRelations = AccommodationBase & {
  location: Pick<Location, "id" | "name" | "atoll" | "slug">;
  images: Pick<AccommodationImage, "id" | "url" | "alt" | "sortOrder">[];
  _count: {
    packages: number;
  };
};

// Type for full accommodation details page
export type AccommodationDetails = AccommodationBase & {
  location: Location & {
    images: Array<{
      id: string;
      url: string;
      alt: string | null;
      sortOrder: number;
    }>;
  };
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
  }>;
  packages: Array<
    Package & {
      location: Pick<Location, "id" | "name" | "atoll">;
      pricing: PackagePricing[];
    }
  >;
};

// Filter interface
export interface AccommodationFilters {
  type?: string;
  location?: string;
  atoll?: string;
  search?: string;
  starRating?: number;
}

// Sort options
export type AccommodationSortOption =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "rating-desc"
  | "rating-asc";

// Filter options type
export interface AccommodationFilterOptions {
  types: AccommodationType[];
  atolls: string[];
  locations: Array<{
    id: string;
    name: string;
    slug: string;
    atoll: string;
    _count: {
      accommodations: number;
    };
  }>;
}

/**
 * Fetch accommodations with filters and sorting
 */
async function getAccommodationsQuery(
  filters: AccommodationFilters = {},
  sort: AccommodationSortOption = "featured"
): Promise<AccommodationWithRelations[]> {
  const { type, location, atoll, search, starRating } = filters;

  // Build where clause
  const where: Prisma.AccommodationWhereInput = {
    isActive: true,
  };

  // Filter by type
  if (type) {
    where.type = type as AccommodationType;
  }

  // Filter by location
  if (location) {
    where.location = {
      slug: location,
    };
  }

  // Filter by atoll
  if (atoll) {
    where.location = {
      ...((where.location as Prisma.LocationWhereInput) || {}),
      atoll: atoll,
    };
  }

  // Filter by star rating
  if (starRating !== undefined) {
    // Either the stay's own rating or, where it has none, its island's. Written
    // as an OR rather than a COALESCE because Prisma has no COALESCE, and as two
    // explicit arms so a guesthouse rated 3 on a 5-star island is not swept in
    // by the island's rating.
    where.AND = [
      ...((where.AND as Prisma.AccommodationWhereInput[]) ?? []),
      {
        OR: [
          { starRating: { gte: starRating } },
          { starRating: null, location: { starRating: { gte: starRating } } },
        ],
      },
    ];
  }

  // Search in name, description, location name
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { shortDesc: { contains: search } },
      { location: { name: { contains: search } } },
    ];
  }

  // Build orderBy
  let orderBy:
    | Prisma.AccommodationOrderByWithRelationInput
    | Prisma.AccommodationOrderByWithRelationInput[];

  switch (sort) {
    case "featured":
      orderBy = [{ sortOrder: "asc" }, { createdAt: "desc" }];
      break;
    case "name-asc":
      orderBy = { name: "asc" };
      break;
    case "name-desc":
      orderBy = { name: "desc" };
      break;
    case "rating-desc":
      orderBy = [
        { starRating: "desc" },
        { location: { starRating: "desc" } },
        { name: "asc" },
      ];
      break;
    case "rating-asc":
      orderBy = [
        { starRating: "asc" },
        { location: { starRating: "asc" } },
        { name: "asc" },
      ];
      break;
    default:
      orderBy = [{ sortOrder: "asc" }, { createdAt: "desc" }];
  }

  const accommodations = await prisma.accommodation.findMany({
    where,
    orderBy,
    include: {
      location: {
        select: {
          id: true,
          name: true,
          atoll: true,
          slug: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: {
          id: true,
          url: true,
          alt: true,
          sortOrder: true,
        },
      },
      _count: {
        select: {
          packages: true,
        },
      },
    },
  });

  return accommodations as AccommodationWithRelations[];
}

const getAccommodationsCached = unstable_cache(
  async (filters: AccommodationFilters, sort: AccommodationSortOption) =>
    getAccommodationsQuery(filters, sort),
  ["accommodations:list"],
  { revalidate: 30 }
);

export async function getAccommodations(
  filters: AccommodationFilters = {},
  sort: AccommodationSortOption = "featured"
): Promise<AccommodationWithRelations[]> {
  return getAccommodationsCached(filters, sort);
}

/**
 * Get unique filter options
 */
async function getAccommodationFilterOptionsQuery(): Promise<AccommodationFilterOptions> {
  const [types, atolls, locations] = await Promise.all([
    // Get all unique accommodation types that have active accommodations
    prisma.accommodation.findMany({
      where: {
        isActive: true,
      },
      select: {
        type: true,
      },
      distinct: ["type"],
    }),

    // Get all unique atolls
    prisma.location.findMany({
      where: {
        accommodations: {
          some: {
            isActive: true,
          },
        },
      },
      select: {
        atoll: true,
      },
      distinct: ["atoll"],
      orderBy: {
        atoll: "asc",
      },
    }),

    // Get all locations with accommodation count
    prisma.location.findMany({
      where: {
        accommodations: {
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
            accommodations: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return {
    types: types.map((t) => t.type),
    atolls: atolls.map((a) => a.atoll),
    locations,
  };
}

const getAccommodationFilterOptionsCached = unstable_cache(
  async () => getAccommodationFilterOptionsQuery(),
  ["accommodations:filter-options"],
  { revalidate: 300 }
);

export async function getAccommodationFilterOptions(): Promise<AccommodationFilterOptions> {
  return getAccommodationFilterOptionsCached();
}

/**
 * Get accommodation details by slug for details page
 */
export async function getAccommodationBySlug(
  slug: string
): Promise<AccommodationDetails | null> {
  const accommodation = await prisma.accommodation.findUnique({
    where: {
      slug,
      isActive: true,
    },
    include: {
      location: {
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              url: true,
              alt: true,
              sortOrder: true,
            },
          },
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          url: true,
          alt: true,
          sortOrder: true,
        },
      },
      packages: {
        where: { isActive: true },
        take: 6,
        include: {
          location: {
            select: {
              id: true,
              name: true,
              atoll: true,
            },
          },
          pricing: {
            where: {
              market: "INTERNATIONAL",
            },
          },
        },
        orderBy: { isFeatured: "desc" },
      },
    },
  });

  return accommodation as AccommodationDetails | null;
}

/**
 * Get featured accommodations for home page
 */
export async function getFeaturedAccommodations(
  limit: number = 6
): Promise<AccommodationWithRelations[]> {
  const accommodations = await prisma.accommodation.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      location: {
        select: {
          id: true,
          name: true,
          atoll: true,
          slug: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: {
          id: true,
          url: true,
          alt: true,
          sortOrder: true,
        },
      },
      _count: {
        select: {
          packages: true,
        },
      },
    },
  });

  return accommodations as AccommodationWithRelations[];
}

/**
 * Get accommodations by type
 */
export async function getAccommodationsByType(
  type: AccommodationType,
  limit?: number
): Promise<AccommodationWithRelations[]> {
  const accommodations = await prisma.accommodation.findMany({
    where: {
      isActive: true,
      type,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    ...(limit && { take: limit }),
    include: {
      location: {
        select: {
          id: true,
          name: true,
          atoll: true,
          slug: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: {
          id: true,
          url: true,
          alt: true,
          sortOrder: true,
        },
      },
      _count: {
        select: {
          packages: true,
        },
      },
    },
  });

  return accommodations as AccommodationWithRelations[];
}

/**
 * Get accommodations by location
 */
export async function getAccommodationsByLocation(
  locationSlug: string,
  limit?: number
): Promise<AccommodationWithRelations[]> {
  const accommodations = await prisma.accommodation.findMany({
    where: {
      isActive: true,
      location: {
        slug: locationSlug,
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    ...(limit && { take: limit }),
    include: {
      location: {
        select: {
          id: true,
          name: true,
          atoll: true,
          slug: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: {
          id: true,
          url: true,
          alt: true,
          sortOrder: true,
        },
      },
      _count: {
        select: {
          packages: true,
        },
      },
    },
  });

  return accommodations as AccommodationWithRelations[];
}

/**
 * Get accommodations by atoll
 */
export async function getAccommodationsByAtoll(
  atoll: string,
  limit?: number
): Promise<AccommodationWithRelations[]> {
  const accommodations = await prisma.accommodation.findMany({
    where: {
      isActive: true,
      location: {
        atoll,
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    ...(limit && { take: limit }),
    include: {
      location: {
        select: {
          id: true,
          name: true,
          atoll: true,
          slug: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: {
          id: true,
          url: true,
          alt: true,
          sortOrder: true,
        },
      },
      _count: {
        select: {
          packages: true,
        },
      },
    },
  });

  return accommodations as AccommodationWithRelations[];
}

/**
 * Search accommodations
 */
export async function searchAccommodations(
  query: string,
  limit: number = 10
): Promise<AccommodationWithRelations[]> {
  const accommodations = await prisma.accommodation.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
        { shortDesc: { contains: query } },
        { location: { name: { contains: query } } },
        { location: { atoll: { contains: query } } },
      ],
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      location: {
        select: {
          id: true,
          name: true,
          atoll: true,
          slug: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: {
          id: true,
          url: true,
          alt: true,
          sortOrder: true,
        },
      },
      _count: {
        select: {
          packages: true,
        },
      },
    },
  });

  return accommodations as AccommodationWithRelations[];
}

// ============================================================================
// Redesign loaders. See the note in lib/data/packages.ts.
//
// "Stay" rather than "accommodation" throughout, because that is the word the
// designs use in the nav and on the page.
// ============================================================================

export interface StayCard {
  id: string;
  slug: string;
  name: string;
  blurb: string | null;
  islandName: string;
  islandSlug: string;
  /** The ISLAND's rating. A villa type has none of its own. */
  starRating: number | null;
  /** "Guesthouse" — the badge pill. */
  typeLabel: string;
  type: AccommodationType;
  rooms: string | null;
  board: string | null;
  transfer: string | null;
  nightlyFrom: number | null;
  /** "In 1 package" */
  packagesLine: string;
  packageCount: number;
  coverImage: string | null;
  photoRich: boolean;
}

export async function getStayCards(opts: { locationSlug?: string } = {}): Promise<StayCard[]> {
  const rows = await prisma.accommodation.findMany({
    where: {
      isActive: true,
      ...(opts.locationSlug ? { location: { slug: opts.locationSlug } } : {}),
    },
    select: {
      id: true,
      slug: true,
      name: true,
      shortDesc: true,
      type: true,
      starRating: true,
      boardOptions: true,
      coverImage: true,
      sortOrder: true,
      location: {
        select: {
          name: true,
          slug: true,
          transferType: true,
          transferTime: true,
          starRating: true,
        },
      },
      roomTypes: { select: { name: true, nightlyFrom: true }, orderBy: { sortOrder: "asc" } },
      images: { select: { url: true }, take: 1 },
      _count: { select: { packages: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return rows.map((a) => {
    const prices = a.roomTypes
      .map((r) => r.nightlyFrom)
      .filter((n): n is number => n !== null);

    return {
      id: a.id,
      slug: a.slug,
      name: a.name,
      blurb: a.shortDesc,
      islandName: a.location.name,
      islandSlug: a.location.slug,
      // The stay's own if it has one — a guesthouse — otherwise the
      // island's, which is how a resort's villa types inherit the resort's.
      starRating: a.starRating ?? a.location.starRating,
      typeLabel: accommodationTypeLabel(a.type),
      type: a.type,
      // Null when nothing is entered yet, so the spec row drops rather than
      // printing a label with nothing beside it.
      rooms: a.roomTypes.length > 0 ? a.roomTypes.map((r) => r.name).join(", ") : null,
      board: a.boardOptions,
      transfer: transferSummary(a.location.transferType, a.location.transferTime),
      nightlyFrom: prices.length > 0 ? Math.min(...prices) : null,
      packagesLine: packagesLine(a._count.packages),
      packageCount: a._count.packages,
      coverImage: a.coverImage,
      photoRich: isPhotoRich({ coverImage: a.coverImage, images: a.images }),
    };
  });
}

export interface StayDetailData extends StayCard {
  description: string;
  /** The island's rating. A villa type does not have one of its own. */
  starRating: number | null;
  houseReef: string | null;
  suits: string | null;
  absentNote: string | null;
  images: { id: string; url: string; alt: string | null }[];
  roomTypes: {
    id: string;
    name: string;
    blurb: string | null;
    nightlyFrom: number | null;
    size: string | null;
    sleeps: string | null;
    access: string | null;
  }[];
  /** Grouped in insertion order; the design renders one column per group. */
  facilityGroups: { group: string; items: string[] }[];
  faqs: { id: string; question: string; answer: string }[];
  packageSlug: string | null;
}

export async function getStayDetail(slug: string): Promise<StayDetailData | null> {
  const row = await prisma.accommodation.findUnique({
    where: { slug },
    include: {
      location: true,
      images: { orderBy: { sortOrder: "asc" } },
      roomTypes: { orderBy: { sortOrder: "asc" } },
      facilities: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
      packages: {
        where: { isActive: true },
        select: { slug: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      _count: { select: { packages: true } },
    },
  });
  if (!row || !row.isActive) return null;

  const prices = row.roomTypes
    .map((r) => r.nightlyFrom)
    .filter((n): n is number => n !== null);

  const groups: { group: string; items: string[] }[] = [];
  for (const f of row.facilities) {
    const existing = groups.find((g) => g.group === f.group);
    if (existing) existing.items.push(f.item);
    else groups.push({ group: f.group, items: [f.item] });
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    blurb: row.shortDesc,
    islandName: row.location.name,
    islandSlug: row.location.slug,
    typeLabel: accommodationTypeLabel(row.type),
    type: row.type,
    rooms: row.roomTypes.length > 0 ? row.roomTypes.map((r) => r.name).join(", ") : null,
    board: row.boardOptions,
    transfer: transferSummary(row.location.transferType, row.location.transferTime),
    nightlyFrom: prices.length > 0 ? Math.min(...prices) : null,
    packagesLine: packagesLine(row._count.packages),
    packageCount: row._count.packages,
    coverImage: row.coverImage,
    photoRich: isPhotoRich({ coverImage: row.coverImage, images: row.images }),
    description: row.description,
    starRating: row.starRating ?? row.location.starRating,
    houseReef: row.houseReef,
    suits: row.suits,
    absentNote: row.absentNote,
    images: row.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })),
    roomTypes: row.roomTypes.map((r) => ({
      id: r.id,
      name: r.name,
      blurb: r.blurb,
      nightlyFrom: r.nightlyFrom,
      size: r.size,
      sleeps: r.sleeps,
      access: r.access,
    })),
    facilityGroups: groups,
    faqs: row.faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
    packageSlug: row.packages[0]?.slug ?? null,
  };
}
