// app/packages/page.tsx
import { Suspense } from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { PackageCard } from "@/components/packages/package-card";
import { PackageFilters } from "@/components/packages/package-filters";
import { getPackages, getFilterOptions, SortOption } from "@/lib/data/packages";
import type { Market } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MessageCircle, Phone } from "lucide-react";
import { SortDropdown } from "@/components/packages/sort-dropdown";
import { getImageUrl } from "@/lib/image-urls";
import { PageHero } from "@/components/layout/page-hero";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  searchParams: Promise<{
    location?: string;
    accommodationType?: string;
    minPrice?: string;
    maxPrice?: string;
    duration?: string;
    search?: string;
    sort?: string;
  }>;
}

async function getMarket(): Promise<Market> {
  const cookieStore = await cookies();
  const marketCookie = cookieStore.get("market");
  return (marketCookie?.value as Market) || "INTERNATIONAL";
}

// Rendered at request time on the server (DB is local; not built off-server).
export const dynamic = "force-dynamic";

export default async function PackagesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const market = await getMarket();
  const filterOptionsPromise = getFilterOptions();

  // Parse duration filter
  let minNights: number | undefined;
  let maxNights: number | undefined;
  if (params.duration) {
    const [min, max] = params.duration.split("-");
    minNights = parseInt(min);
    maxNights = max ? parseInt(max) : undefined;
  }

  const [packages, filterOptions] = await Promise.all([
    getPackages(
      {
        location: params.location,
        accommodationType: params.accommodationType,
        minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
        minNights,
        maxNights,
        search: params.search,
      },
      (params.sort as SortOption) || "featured",
      market
    ),
    filterOptionsPromise,
  ]);

  // Currency
  const currency = market === "LOCAL" ? "MVR" : "USD";

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        backgroundSrc={getImageUrl("images", "hero/maldives-aerial.jpg")}
        backgroundAlt="Maldives aerial"
        overlayTone="medium"
        minHeightClassName="min-h-[clamp(24rem,52vh,36rem)]"
        title={
          <>
            Explore Our
            <br />
            <span className="font-display italic">Travel Packages</span>
          </>
        }
        subtitle="Discover handpicked Maldives experiences, from budget-friendly local islands to luxury resort escapes. Every package includes accommodation, activities, and unforgettable moments."
      />

      {/* Filters Section */}
      <Section spacing="sm" surface="plain" className="border-b border-gray-200">
        <Container>
          <Suspense fallback={<FiltersSkeleton />}>
            <PackageFilters filterOptions={filterOptions} />
          </Suspense>
        </Container>
      </Section>

      {/* Results Section */}
      <Section spacing="md" surface="plain">
        <Container>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {packages.length === 0
                  ? "No packages found"
                  : `${packages.length} ${
                      packages.length === 1 ? "Package" : "Packages"
                    } Available`}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing prices in {currency}
              </p>
            </div>

            {/* Sort Dropdown */}
            <SortDropdown currentSort={params.sort || "featured"} />
          </div>

          {/* Package Grid */}
          {packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} package={pkg} currency={currency} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full surface-maldives-empty mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">
                No packages found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Try adjusting your filters to see more results, or clear all
                filters to view our complete collection.
              </p>
              <Link href="/packages">
                <Button size="lg">Clear All Filters</Button>
              </Link>
            </div>
          )}
        </Container>
      </Section>

      {/* CTA Section */}
      <Section spacing="lg" surface="soft">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" size="lg" className="mb-6">
              Tailored Island Journeys
            </Badge>
            <h2 className="text-4xl md:text-5xl font-display mb-6 text-gray-900">
              Can&apos;t Find What You&apos;re Looking For?
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Let us create a custom package tailored to your dreams. Contact
              our travel experts today for personalized recommendations.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="bg-[var(--maldives-ink-900)] text-white hover:bg-[#09101d] gap-2 shadow-xl btn-interactive btn-shimmer"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Us
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300 text-gray-800 hover:bg-white gap-2 btn-interactive"
              >
                <Phone className="w-5 h-5" />
                Call +960 123 4567
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}

// Loading skeleton for filters
function FiltersSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="md:col-span-2">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}
