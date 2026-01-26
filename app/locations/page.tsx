// app/locations/page.tsx
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/image-urls";
import { Navbar } from "@/components/layout/nav-bar";
import { Footer } from "@/components/layout/footer";
import {
  MapPin,
  Compass,
  Waves,
  Hotel,
  Plane,
  Ship,
  Clock,
} from "lucide-react";
import { getLocations, getLocationFilterOptions } from "@/lib/data/locations";
import { LocationFilters } from "@/components/locations/location-filters";

// Icon mapping for transfer types
const transferIcons = {
  SPEEDBOAT: Ship,
  SEAPLANE: Plane,
  DOMESTIC_FLIGHT: Plane,
  FERRY: Ship,
  YACHT: Ship,
};

interface PageProps {
  searchParams: Promise<{
    atoll?: string;
    transferType?: string;
    search?: string;
  }>;
}

export default async function LocationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [locations, filterOptions] = await Promise.all([
    getLocations({
      atoll: params.atoll,
      transferType: params.transferType,
      search: params.search,
      hasPackages: true,
    }),
    getLocationFilterOptions(),
  ]);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 parallax-bg">
            <Image
              src={getImageUrl("images", "hero/maldives-aerial.jpg")}
              alt="Maldives Locations"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>

        <Navbar variant="overlay" showLogo={true} />

        <Container className="relative z-10 pt-32 pb-16">
          <div className="max-w-4xl">
            <Badge
              variant="glass"
              size="lg"
              className="text-white border-white/20 mb-6 gap-2"
            >
              <Compass className="w-4 h-4" />
              Explore the Maldives
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-white mb-6">
              <span className="font-light">Discover</span>
              <br />
              <span className="font-display italic">Paradise Islands</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl">
              From vibrant local islands to secluded resort paradises. Each
              atoll offers unique experiences, dive sites, and unforgettable
              moments in crystal-clear waters.
            </p>

            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center gap-2 text-white">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{locations.length}</div>
                  <div className="text-sm text-white/80">Destinations</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Hotel className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {locations.reduce(
                      (sum, loc) => sum + loc._count.accommodations,
                      0
                    )}
                  </div>
                  <div className="text-sm text-white/80">Accommodations</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Waves className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">26</div>
                  <div className="text-sm text-white/80">Atolls</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Filter Section */}
      <Section className="py-12 bg-gray-50 border-b border-gray-200">
        <Container>
          <LocationFilters
            atolls={filterOptions.atolls}
            transferTypes={filterOptions.transferTypes}
            currentAtoll={params.atoll}
            currentTransferType={params.transferType}
          />
        </Container>
      </Section>

      {/* Bento Box Grid */}
      <Section className="py-16 bg-white">
        <Container>
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {params.atoll ? `${params.atoll} Locations` : "All Locations"}
            </h2>
            <p className="text-gray-600">
              {locations.length === 0
                ? "No locations found"
                : `Explore ${locations.length} unique ${
                    locations.length === 1 ? "destination" : "destinations"
                  } across the Maldives`}
            </p>
          </div>

          {locations.length > 0 ? (
            <div className="grid grid-cols-12 gap-4 md:gap-6">
              {locations.map((location, index) => {
                // Bento box pattern - repeating every 8 items
                const pattern = index % 8;

                let colSpan = "col-span-12 md:col-span-4";
                let height = "h-[300px]";

                switch (pattern) {
                  case 0: // Large hero
                    colSpan = "col-span-12 md:col-span-8";
                    height = "h-[300px] md:h-[624px]";
                    break;
                  case 1: // Tall right
                    colSpan = "col-span-12 md:col-span-4";
                    height = "h-[300px] md:h-[624px]";
                    break;
                  case 2: // Medium left
                    colSpan = "col-span-12 md:col-span-5";
                    height = "h-[300px]";
                    break;
                  case 3: // Medium right
                    colSpan = "col-span-12 md:col-span-7";
                    height = "h-[300px]";
                    break;
                  case 4: // Small left
                    colSpan = "col-span-6 md:col-span-3";
                    height = "h-[280px]";
                    break;
                  case 5: // Small center-left
                    colSpan = "col-span-6 md:col-span-3";
                    height = "h-[280px]";
                    break;
                  case 6: // Medium center-right
                    colSpan = "col-span-12 md:col-span-6";
                    height = "h-[280px]";
                    break;
                  case 7: // Wide bottom
                    colSpan = "col-span-12";
                    height = "h-[280px]";
                    break;
                }

                const isLarge = pattern === 0;
                const isTall = pattern === 1;
                const isSmall = pattern === 4 || pattern === 5;

                const TransferIcon = location.transferType
                  ? transferIcons[location.transferType]
                  : Ship;

                return (
                  <Link
                    key={location.id}
                    href={`/locations/${location.slug}`}
                    className={`group relative rounded-2xl md:rounded-3xl overflow-hidden ${colSpan} ${height}`}
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={getImageUrl(
                          "locations",
                          location.coverImage || "placeholder.jpg"
                        )}
                        alt={location.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>

                    <div
                      className={`absolute inset-0 flex flex-col justify-end ${
                        isSmall ? "p-4" : "p-6 md:p-8"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2 md:mb-3">
                        <Badge
                          className={`bg-white/90 text-gray-900 border-0 ${
                            isSmall ? "text-xs px-2 py-0.5" : ""
                          }`}
                        >
                          {location.atoll}
                        </Badge>
                        {location.transferType && !isSmall && (
                          <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 gap-1.5 text-xs">
                            <TransferIcon className="w-3 h-3" />
                            {location.transferTime
                              ? `${location.transferTime}min`
                              : location.transferType.toLowerCase()}
                          </Badge>
                        )}
                      </div>

                      <h3
                        className={`font-bold text-white mb-2 group-hover:text-teal-300 transition-colors ${
                          isLarge
                            ? "text-3xl md:text-5xl lg:text-6xl"
                            : isTall
                              ? "text-2xl md:text-4xl"
                              : isSmall
                                ? "text-lg md:text-xl"
                                : "text-xl md:text-3xl"
                        }`}
                      >
                        {location.name}
                      </h3>

                      {(isLarge || isTall) && location.shortDesc && (
                        <p className="text-white/80 text-sm md:text-base mb-3 md:mb-4 line-clamp-2">
                          {location.shortDesc}
                        </p>
                      )}

                      {!isSmall && (
                        <div className="flex items-center gap-3 md:gap-4 text-white/80 text-xs md:text-sm">
                          {location._count.accommodations > 0 && (
                            <span className="flex items-center gap-1 md:gap-1.5">
                              <Hotel className="w-3 h-3 md:w-4 md:h-4" />
                              {location._count.accommodations}
                            </span>
                          )}
                          {location._count.packages > 0 && (
                            <span className="flex items-center gap-1 md:gap-1.5">
                              <Compass className="w-3 h-3 md:w-4 md:h-4" />
                              {location._count.packages}
                            </span>
                          )}
                          {location.transferTime && (
                            <span className="flex items-center gap-1 md:gap-1.5">
                              <Clock className="w-3 h-3 md:w-4 md:h-4" />
                              {location.transferTime}min
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {!isSmall && (
                      <div className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-5 h-5 md:w-6 md:h-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <MapPin className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">
                No locations found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Try adjusting your filters to discover more destinations.
              </p>
            </div>
          )}
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="bg-gradient-to-br from-teal-600 to-cyan-600 py-20 text-white">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Explore Paradise?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Let us help you discover the perfect Maldivian island for your
              dream vacation. Each location offers unique experiences waiting to
              be explored.
            </p>
          </div>
        </Container>
      </Section>

      <Footer />
    </main>
  );
}
