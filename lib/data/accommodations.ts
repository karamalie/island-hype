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
    where.starRating = {
      gte: starRating,
    };
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
      orderBy = [{ starRating: "desc" }, { name: "asc" }];
      break;
    case "rating-asc":
      orderBy = [{ starRating: "asc" }, { name: "asc" }];
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
