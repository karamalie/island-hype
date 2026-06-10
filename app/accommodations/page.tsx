// app/accommodations/page.tsx
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getImageUrl } from "@/lib/image-urls";
import { PageHero } from "@/components/layout/page-hero";
import { Footer } from "@/components/layout/footer";
import { MapPin, Star, Users, Waves, Sparkles } from "lucide-react";
import {
  getAccommodations,
  getAccommodationFilterOptions,
} from "@/lib/data/accommodations";
import { AccommodationFilters } from "@/components/accommodations/accommodations-filters";

// Icon mapping for accommodation types
const typeIcons = {
  RESORT: Sparkles,
  GUESTHOUSE: Users,
  HOTEL: Waves,
  LIVEABOARD: Waves,
};

interface PageProps {
  searchParams: Promise<{
    type?: string;
    location?: string;
    search?: string;
  }>;
}

// Rendered at request time on the server (DB is local; not built off-server).
export const dynamic = "force-dynamic";

export default async function AccommodationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [accommodations, filterOptions] = await Promise.all([
    getAccommodations({
      type: params.type,
      atoll: params.location,
      search: params.search,
    }),
    getAccommodationFilterOptions(),
  ]);

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        backgroundSrc={getImageUrl("images", "hero/maldives-aerial.jpg")}
        backgroundAlt="Maldives accommodations"
        overlayTone="medium"
        minHeightClassName="min-h-[clamp(24rem,52vh,36rem)]"
        badge={
          <Badge variant="glass" size="lg" className="text-white border-white/20 mb-6">
            Where You&apos;ll Stay
          </Badge>
        }
        title={
          <>
            <span className="font-light">Find Your</span>
            <br />
            <span className="font-display italic">Perfect Stay</span>
          </>
        }
        subtitle="From luxury overwater villas to authentic island guesthouses. Discover accommodations that match your style and budget across the Maldives."
      />

      {/* Filter Section */}
      <Section spacing="sm" surface="plain" className="border-b border-gray-200">
        <Container>
          <AccommodationFilters
            atolls={filterOptions.atolls}
            currentType={params.type}
            currentLocation={params.location}
          />
        </Container>
      </Section>

      {/* Results Section */}
      <Section spacing="md" surface="plain">
        <Container>
          {/* Results Header */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {accommodations.length === 0
                ? "No accommodations found"
                : `${accommodations.length} ${
                    accommodations.length === 1
                      ? "Accommodation"
                      : "Accommodations"
                  } Available`}
            </h2>
            {params.type && (
              <p className="text-gray-600 mt-2">
                Showing {params.type.toLowerCase()}s
                {params.location && ` in ${params.location}`}
              </p>
            )}
          </div>

          {/* Accommodations Grid */}
          {accommodations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {accommodations.map((accommodation) => {
                const Icon = typeIcons[accommodation.type];
                return (
                  <Link
                    key={accommodation.id}
                    href={`/accommodations/${accommodation.slug}`}
                  >
                    <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                      {/* Image */}
                      <div className="relative h-64 overflow-hidden">
                        <div className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-110">
                          <Image
                            src={getImageUrl(
                              "accommodations",
                              accommodation.coverImage || "placeholder.jpg"
                            )}
                            alt={accommodation.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Type Badge */}
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/90 text-gray-900 border-0 gap-1.5">
                            <Icon className="w-3.5 h-3.5" />
                            {accommodation.type.toLowerCase()}
                          </Badge>
                        </div>

                        {/* Star Rating */}
                        {accommodation.starRating && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-gray-900">
                              {accommodation.starRating}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Content */}
                      <div className="p-6">
                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">
                            {accommodation.location.name}
                          </span>
                        </div>

                        {/* Name */}
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                          {accommodation.name}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                          {accommodation.shortDesc || accommodation.description}
                        </p>

                        {/* Amenities Preview */}
                        {accommodation.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {accommodation.amenities
                              .slice(0, 3)
                              .map((amenity) => (
                                <span
                                  key={amenity}
                                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                                >
                                  {amenity}
                                </span>
                              ))}
                            {accommodation.amenities.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                +{accommodation.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full surface-maldives-empty mb-6">
                <Waves className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">
                No accommodations found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Try adjusting your filters to see more results.
              </p>
              <Link href="/accommodations">
                <Button>Clear Filters</Button>
              </Link>
            </div>
          )}
        </Container>
      </Section>

      {/* CTA Section - Inspired by Image 2 */}
      <Section
        spacing="lg"
        surface="soft"
      >
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="primary" size="lg" className="mb-6">
              Why Choose Island Hype
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              We ensure that your travel process
              <br />
              is perfectly accommodated.
            </h2>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {[
                {
                  icon: Sparkles,
                  title: "Best Selection",
                  description:
                    "Handpicked resorts and guesthouses across all atolls",
                },
                {
                  icon: Users,
                  title: "Personalized Service",
                  description:
                    "Dedicated support to find your perfect accommodation",
                },
                {
                  icon: Star,
                  title: "Verified Quality",
                  description: "All properties personally inspected and rated",
                },
                {
                  icon: Waves,
                  title: "Local Expertise",
                  description: "Insider knowledge of the Maldives islands",
                },
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full surface-maldives-icon mb-4">
                    <feature.icon className="w-8 h-8 text-[var(--maldives-ocean-700)]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </main>
  );
}
