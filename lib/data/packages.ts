// lib/db/packages.ts
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  Package,
  Location,
  Accommodation,
  Experience,
  PackagePricing,
  Offer,
  Market,
  AccommodationType,
} from "@prisma/client";

// Type for package with all relations
export type PackageWithRelations = Package & {
  location: Pick<
    Location,
    "id" | "name" | "atoll" | "slug" | "transferTime" | "transferType"
  >;
  accommodation: Pick<Accommodation, "id" | "name" | "type">;
  pricing: PackagePricing[];
  experiences: Array<{
    experience: Pick<Experience, "id" | "name" | "slug" | "icon">;
  }>;
  offers: Array<Pick<Offer, "id" | "badge" | "discountType" | "discountValue">>;
  _count: {
    activities: number;
  };
};

// Type for full package details page
export type PackageDetails = Package & {
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
  itinerary: Array<{
    id: string;
    dayNumber: number;
    title: string;
    description: string;
  }>;
  experiences: Array<{
    experience: Experience;
  }>;
  activities: Array<{
    activity: {
      id: string;
      name: string;
      description: string | null;
      duration: number | null;
      category: string;
    };
    isIncluded: boolean;
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
  experience?: string;
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
  experiences: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    _count: {
      packages: number;
    };
  }>;
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
export async function getPackages(
  filters: PackageFilters = {},
  sort: SortOption = "featured",
  market: Market = "INTERNATIONAL"
): Promise<PackageWithRelations[]> {
  const {
    experience,
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

  // Filter by experience
  if (experience) {
    where.experiences = {
      some: {
        experience: {
          slug: experience,
        },
      },
    };
  }

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
      { name: { contains: search, mode: "insensitive" } },
      { shortDesc: { contains: search, mode: "insensitive" } },
      { location: { name: { contains: search, mode: "insensitive" } } },
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

/**
 * Get unique filter options
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  const [experiences, locations, accommodationTypes] = await Promise.all([
    prisma.experience.findMany({
      where: {
        packages: {
          some: {
            package: {
              isActive: true,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        _count: {
          select: {
            packages: true,
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    }),
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
    experiences,
    locations,
    accommodationTypes: accommodationTypes.map((a) => a.type),
  };
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
      itinerary: {
        orderBy: {
          dayNumber: "asc",
        },
      },
      experiences: {
        include: {
          experience: true,
        },
      },
      activities: {
        include: {
          activity: {
            select: {
              id: true,
              name: true,
              description: true,
              duration: true,
              category: true,
            },
          },
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
