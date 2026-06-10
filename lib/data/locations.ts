// lib/data/locations.ts
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import type { Prisma, TransferType } from "@prisma/client";
import type {
  Location,
  LocationImage,
  Accommodation,
  Package,
  PackagePricing,
  Experience,
  Activity,
} from "@prisma/client";

// Type for location with relations (list view)
export type LocationWithRelations = Location & {
  images: Pick<LocationImage, "id" | "url" | "alt" | "sortOrder">[];
  _count: {
    accommodations: number;
    packages: number;
    activities: number;
  };
};

// Type for full location details page
export type LocationDetails = Location & {
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
  }>;
  accommodations: Array<
    Accommodation & {
      images: Array<{
        id: string;
        url: string;
        alt: string | null;
      }>;
      _count: {
        packages: number;
      };
    }
  >;
  packages: Array<
    Package & {
      accommodation: Pick<Accommodation, "id" | "name" | "type">;
      pricing: PackagePricing[];
      experiences: Array<{
        experience: Pick<Experience, "id" | "name" | "slug" | "icon">;
      }>;
    }
  >;
  experiences: Array<{
    experience: Experience;
    description: string | null;
  }>;
  activities: Array<
    Activity & {
      images: Array<{
        id: string;
        url: string;
        alt: string | null;
      }>;
    }
  >;
};

// Filter interface
export interface LocationFilters {
  atoll?: string;
  search?: string;
  hasAccommodations?: boolean;
  hasPackages?: boolean;
  transferType?: string;
}

// Sort options
export type LocationSortOption =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "atoll-asc";

// Filter options type
export interface LocationFilterOptions {
  atolls: string[];
  transferTypes: string[];
}

/**
 * Fetch locations with filters and sorting
 */
async function getLocationsQuery(
  filters: LocationFilters = {},
  sort: LocationSortOption = "featured"
): Promise<LocationWithRelations[]> {
  const { atoll, search, hasAccommodations, hasPackages, transferType } =
    filters;

  // Build where clause
  const where: Prisma.LocationWhereInput = {
    isActive: true,
  };

  // Filter by atoll
  if (atoll) {
    where.atoll = atoll;
  }

  // Filter by transfer type
  if (transferType) {
    where.transferType = transferType as TransferType;
  }

  // Filter locations with accommodations
  if (hasAccommodations) {
    where.accommodations = {
      some: {
        isActive: true,
      },
    };
  }

  // Filter locations with packages
  if (hasPackages) {
    where.packages = {
      some: {
        isActive: true,
      },
    };
  }

  // Search in name, description, atoll, island
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { shortDesc: { contains: search } },
      { atoll: { contains: search } },
      { island: { contains: search } },
    ];
  }

  // Build orderBy
  let orderBy:
    | Prisma.LocationOrderByWithRelationInput
    | Prisma.LocationOrderByWithRelationInput[];

  switch (sort) {
    case "featured":
      orderBy = [{ isFeatured: "desc" }, { sortOrder: "asc" }];
      break;
    case "name-asc":
      orderBy = { name: "asc" };
      break;
    case "name-desc":
      orderBy = { name: "desc" };
      break;
    case "atoll-asc":
      orderBy = [{ atoll: "asc" }, { name: "asc" }];
      break;
    default:
      orderBy = [{ isFeatured: "desc" }, { sortOrder: "asc" }];
  }

  const locations = await prisma.location.findMany({
    where,
    orderBy,
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 3,
        select: {
          id: true,
          url: true,
          alt: true,
          sortOrder: true,
        },
      },
      _count: {
        select: {
          accommodations: true,
          packages: true,
          activities: true,
        },
      },
    },
  });

  return locations as LocationWithRelations[];
}

const getLocationsCached = unstable_cache(
  async (filters: LocationFilters, sort: LocationSortOption) =>
    getLocationsQuery(filters, sort),
  ["locations:list"],
  { revalidate: 30 }
);

export async function getLocations(
  filters: LocationFilters = {},
  sort: LocationSortOption = "featured"
): Promise<LocationWithRelations[]> {
  return getLocationsCached(filters, sort);
}

/**
 * Get unique filter options
 */
async function getLocationFilterOptionsQuery(): Promise<LocationFilterOptions> {
  const [atolls, transferTypes] = await Promise.all([
    // Get all unique atolls
    prisma.location.findMany({
      where: {
        isActive: true,
      },
      select: {
        atoll: true,
      },
      distinct: ["atoll"],
      orderBy: {
        atoll: "asc",
      },
    }),

    // Get all unique transfer types
    prisma.location.findMany({
      where: {
        isActive: true,
        transferType: {
          not: null,
        },
      },
      select: {
        transferType: true,
      },
      distinct: ["transferType"],
    }),
  ]);

  return {
    atolls: atolls.map((a) => a.atoll),
    transferTypes: transferTypes
      .map((t) => t.transferType)
      .filter((t): t is TransferType => t !== null),
  };
}

const getLocationFilterOptionsCached = unstable_cache(
  async () => getLocationFilterOptionsQuery(),
  ["locations:filter-options"],
  { revalidate: 300 }
);

export async function getLocationFilterOptions(): Promise<LocationFilterOptions> {
  return getLocationFilterOptionsCached();
}

/**
 * Get location details by slug for details page
 */
export async function getLocationBySlug(
  slug: string
): Promise<LocationDetails | null> {
  const location = await prisma.location.findUnique({
    where: {
      slug,
      isActive: true,
    },
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
      accommodations: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }],
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
            select: {
              id: true,
              url: true,
              alt: true,
            },
          },
          _count: {
            select: {
              packages: true,
            },
          },
        },
      },
      packages: {
        where: { isActive: true },
        take: 6,
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
        include: {
          accommodation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          pricing: {
            where: {
              market: "INTERNATIONAL",
            },
          },
          experiences: {
            include: {
              experience: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  icon: true,
                },
              },
            },
            take: 3,
          },
        },
      },
      experiences: {
        include: {
          experience: true,
        },
      },
      activities: {
        where: { isActive: true },
        take: 8,
        orderBy: [{ sortOrder: "asc" }],
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
            select: {
              id: true,
              url: true,
              alt: true,
            },
          },
        },
      },
    },
  });

  return location as LocationDetails | null;
}

/**
 * Get featured locations for home page
 */
export async function getFeaturedLocations(
  limit: number = 6
): Promise<LocationWithRelations[]> {
  const locations = await prisma.location.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 3,
        select: {
          id: true,
          url: true,
          alt: true,
          sortOrder: true,
        },
      },
      _count: {
        select: {
          accommodations: true,
          packages: true,
          activities: true,
        },
      },
    },
  });

  return locations as LocationWithRelations[];
}

/**
 * Get locations by atoll
 */
export async function getLocationsByAtoll(
  atoll: string,
  limit?: number
): Promise<LocationWithRelations[]> {
  const locations = await prisma.location.findMany({
    where: {
      isActive: true,
      atoll,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    ...(limit && { take: limit }),
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 3,
        select: {
          id: true,
          url: true,
          alt: true,
          sortOrder: true,
        },
      },
      _count: {
        select: {
          accommodations: true,
          packages: true,
          activities: true,
        },
      },
    },
  });

  return locations as LocationWithRelations[];
}

/**
 * Search locations
 */
export async function searchLocations(
  query: string,
  limit: number = 10
): Promise<LocationWithRelations[]> {
  const locations = await prisma.location.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
        { shortDesc: { contains: query } },
        { atoll: { contains: query } },
        { island: { contains: query } },
      ],
    },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    take: limit,
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 3,
        select: {
          id: true,
          url: true,
          alt: true,
          sortOrder: true,
        },
      },
      _count: {
        select: {
          accommodations: true,
          packages: true,
          activities: true,
        },
      },
    },
  });

  return locations as LocationWithRelations[];
}
