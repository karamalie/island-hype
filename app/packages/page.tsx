// app/packages/page.tsx
import { Suspense } from "react";
import { cookies } from "next/headers";
import Image from "next/image";
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
import { Navbar } from "@/components/layout/nav-bar";

interface PageProps {
  searchParams: Promise<{
    experience?: string;
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

export default async function PackagesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const market = await getMarket();

  // Parse duration filter
  let minNights: number | undefined;
  let maxNights: number | undefined;
  if (params.duration) {
    const [min, max] = params.duration.split("-");
    minNights = parseInt(min);
    maxNights = max ? parseInt(max) : undefined;
  }

  // Fetch packages with filters
  const packages = await getPackages(
    {
      experience: params.experience,
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
  );

  // Fetch filter options
  const filterOptions = await getFilterOptions();

  // Currency
  const currency = market === "LOCAL" ? "MVR" : "USD";

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Header with Parallax Background */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        {/* Parallax Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 parallax-bg">
            <Image
              src={getImageUrl("images", "hero/maldives-aerial.jpg")}
              alt="Maldives"
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/20" />
        </div>

        {/* Navbar */}
        <Navbar variant="overlay" showLogo={true} />

        {/* Hero Content */}
        <Container className="relative z-10 pt-32 pb-16">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight text-white">
              Explore Our
              <br />
              <span className="font-display italic">Travel Packages</span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Discover handpicked Maldives experiences, from budget-friendly
              local islands to luxury resort escapes. Every package includes
              accommodation, activities, and unforgettable moments.
            </p>
          </div>
        </Container>
      </section>

      {/* Filters Section */}
      <Section className="bg-gray-50 py-12">
        <Container>
          <Suspense fallback={<FiltersSkeleton />}>
            <PackageFilters filterOptions={filterOptions} />
          </Suspense>
        </Container>
      </Section>

      {/* Results Section */}
      <Section className="py-16 bg-gray-50">
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
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">
                No packages found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Try adjusting your filters to see more results, or clear all
                filters to view our complete collection.
              </p>
              <Button
                onClick={() => (window.location.href = "/packages")}
                size="lg"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="bg-gray-900 text-white py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-display mb-6">
              Can&apos;t Find What You&apos;re Looking For?
            </h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Let us create a custom package tailored to your dreams. Contact
              our travel experts today for personalized recommendations.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 gap-2 shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Us
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 gap-2"
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
