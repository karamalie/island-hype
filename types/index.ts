// types/index.ts
import type {
  Package,
  PackagePricing,
  PackageInclusion,
  PackageItinerary,
  Location,
  Accommodation,
  Experience,
  Activity,
  Offer,
  Market,
  AccommodationType,
  ActivityCategory,
  TransferType,
  InclusionCategory,
} from "@prisma/client";

// Re-export Prisma enums for convenience
export type {
  Market,
  AccommodationType,
  ActivityCategory,
  TransferType,
  InclusionCategory,
};

// ============ Package Types ============

export type PackageWithRelations = Package & {
  location: Location;
  accommodation: Accommodation;
  pricing: PackagePricing[];
  inclusions: PackageInclusion[];
  itinerary: PackageItinerary[];
  experiences: {
    experience: Experience;
  }[];
  activities: {
    activity: Activity;
    isIncluded: boolean;
  }[];
  offers: Offer[];
  images: {
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
  }[];
};

export type PackageCardData = Pick<
  Package,
  | "id"
  | "slug"
  | "name"
  | "shortDesc"
  | "coverImage"
  | "minNights"
  | "isFeatured"
> & {
  location: Pick<Location, "name" | "atoll">;
  accommodation: Pick<Accommodation, "name" | "type">;
  pricing: PackagePricing[];
  experiences: {
    experience: Pick<Experience, "id" | "name" | "icon">;
  }[];
  offers: Pick<Offer, "badge" | "discountType" | "discountValue">[];
};

export type PackageListItem = PackageCardData;

// ============ Location Types ============

export type LocationWithRelations = Location & {
  accommodations: Accommodation[];
  experiences: {
    experience: Experience;
  }[];
  activities: Activity[];
  packages: Package[];
  images: {
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
  }[];
};

export type LocationCardData = Pick<
  Location,
  "id" | "slug" | "name" | "atoll" | "shortDesc" | "coverImage"
> & {
  _count: {
    packages: number;
    accommodations: number;
  };
};

// ============ Experience Types ============

export type ExperienceWithRelations = Experience & {
  locations: {
    location: Location;
  }[];
  packages: {
    package: Package;
  }[];
  images: {
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
  }[];
};

export type ExperienceCardData = Pick<
  Experience,
  "id" | "slug" | "name" | "shortDesc" | "icon" | "coverImage"
> & {
  _count: {
    packages: number;
  };
};

// ============ Accommodation Types ============

export type AccommodationWithRelations = Accommodation & {
  location: Location;
  packages: Package[];
  images: {
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
  }[];
};

// ============ Filter & Sort Types ============

export type SortOption = "price-asc" | "price-desc" | "name-asc" | "featured";

export interface PackageFilters {
  experience?: string;
  location?: string;
  accommodationType?: AccommodationType;
  minPrice?: number;
  maxPrice?: number;
  minNights?: number;
  maxNights?: number;
}

export interface PackageSearchParams extends PackageFilters {
  sort?: SortOption;
  page?: number;
  limit?: number;
}

// ============ Form Types ============

export interface InquiryFormData {
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  packageId?: string;
  checkIn?: Date;
  checkOut?: Date;
  adults: number;
  children: number;
  infants: number;
  message: string;
  specialRequests?: string;
  arrivalFlight?: string;
  departureFlight?: string;
}

// ============ API Response Types ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// ============ Component Props Types ============

export interface ImageData {
  url: string;
  alt?: string;
}

export interface PriceDisplayProps {
  pricing: PackagePricing[];
  market: Market;
  showPerNight?: boolean;
}

export interface GalleryProps {
  images: ImageData[];
  className?: string;
}

// ============ Navigation Types ============

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ============ Rich Text Types ============

export interface RichTextContent {
  type: "doc";
  content: RichTextNode[];
}

export interface RichTextNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  text?: string;
  marks?: RichTextMark[];
}

export interface RichTextMark {
  type: string;
  attrs?: Record<string, unknown>;
}
