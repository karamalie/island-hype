// app/locations/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Plane,
  Ship,
  Clock,
  Hotel,
  Compass,
  Star,
  Calendar,
  Users,
  Sparkles,
} from "lucide-react";
import { getImageUrl } from "@/lib/image-urls";
import { getLocationBySlug } from "@/lib/data/locations";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";

// Transfer type icons
const transferIcons = {
  SPEEDBOAT: Ship,
  SEAPLANE: Plane,
  DOMESTIC_FLIGHT: Plane,
  FERRY: Ship,
  YACHT: Ship,
};

// Accommodation type icons
const accommodationIcons = {
  RESORT: Sparkles,
  GUESTHOUSE: Hotel,
  HOTEL: Hotel,
  LIVEABOARD: Ship,
};

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function LocationDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);

  if (!location) {
    notFound();
  }

  const TransferIcon = location.transferType
    ? transferIcons[location.transferType]
    : Ship;

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href="/locations"
              className="text-gray-600 hover:text-gray-900"
            >
              Locations
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{location.name}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="border-b border-gray-200 bg-maldives-sand-lagoon">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="flex items-center flex-wrap gap-3 mb-5">
            <Badge variant="outline" size="lg" className="border-gray-300 text-gray-800">
              {location.atoll}
            </Badge>
            {location.island && (
              <Badge variant="outline" size="lg" className="border-gray-300 text-gray-800">
                <MapPin className="w-4 h-4" />
                {location.island}
              </Badge>
            )}
            {location.transferType && (
              <Badge variant="outline" size="lg" className="border-gray-300 text-gray-800 gap-1.5">
                <TransferIcon className="w-4 h-4" />
                {location.transferType.toLowerCase().replace("_", " ")}
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 max-w-4xl">
            {location.name}
          </h1>

          {location.shortDesc && (
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mb-6">
              {location.shortDesc}
            </p>
          )}

          <div className="flex flex-wrap gap-4">
            {location.transferTime && (
              <div className="bg-white px-5 py-3 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3 text-gray-900">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <div>
                    <div className="text-xs text-gray-500">From Malé Airport</div>
                    <div className="text-base font-semibold">{location.transferTime} minutes</div>
                  </div>
                </div>
              </div>
            )}
            {location.accommodations.length > 0 && (
              <div className="bg-white px-5 py-3 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3 text-gray-900">
                  <Hotel className="w-5 h-5 text-teal-600" />
                  <div>
                    <div className="text-xs text-gray-500">Accommodations</div>
                    <div className="text-base font-semibold">{location.accommodations.length} properties</div>
                  </div>
                </div>
              </div>
            )}
            {location.packages.length > 0 && (
              <div className="bg-white px-5 py-3 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3 text-gray-900">
                  <Compass className="w-5 h-5 text-teal-600" />
                  <div>
                    <div className="text-xs text-gray-500">Packages</div>
                    <div className="text-base font-semibold">{location.packages.length}+ available</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* About Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                About {location.name}
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                  {location.description}
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-200">
              <Image
                src={getImageUrl(
                  "locations",
                  location.coverImage || "placeholder.jpg"
                )}
                alt={location.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Transfer Info */}
          {location.transferInfo && (
            <div className="mt-8 bg-teal-50 rounded-2xl p-6 max-w-4xl">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Plane className="w-5 h-5 text-teal-600" />
                Getting There
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {location.transferInfo}
              </p>
            </div>
          )}
        </section>

        {/* Experiences Section */}
        {location.experiences.length > 0 && (
          <section className="mb-20">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                What You Can Experience Here
              </h2>
              <p className="text-gray-600 text-lg">
                Unique activities and adventures available at this location
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {location.experiences.map(({ experience, description }) => (
                <Card
                  key={experience.id}
                  className="border-0 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6">
                    {experience.icon && (
                      <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                        <span className="text-2xl">{experience.icon}</span>
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {experience.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {description || experience.shortDesc}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Accommodations Section */}
        {location.accommodations.length > 0 && (
          <section className="mb-20">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Where to Stay
              </h2>
              <p className="text-gray-600 text-lg">
                {location.accommodations.length} accommodation options available
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {location.accommodations.map((accommodation) => {
                const Icon = accommodationIcons[accommodation.type];
                return (
                  <Link
                    key={accommodation.id}
                    href={`/accommodations/${accommodation.slug}`}
                  >
                    <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={getImageUrl(
                            "accommodations",
                            accommodation.coverImage || "placeholder.jpg"
                          )}
                          alt={accommodation.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
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
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                          {accommodation.name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-3">
                          {accommodation.shortDesc || accommodation.description}
                        </p>
                        <div className="text-sm text-gray-500">
                          {accommodation._count.packages} package
                          {accommodation._count.packages !== 1 ? "s" : ""}{" "}
                          available
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Packages Section */}
        {location.packages.length > 0 && (
          <section className="mb-20">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Featured Packages
              </h2>
              <p className="text-gray-600 text-lg">
                Ready-made travel experiences at {location.name}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {location.packages.map((pkg) => {
                const pricing = pkg.pricing[0];
                return (
                  <Link key={pkg.id} href={`/packages/${pkg.slug}`}>
                    <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            {/* Experience Badges */}
                            {pkg.experiences.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {pkg.experiences
                                  .slice(0, 3)
                                  .map(({ experience }) => (
                                    <Badge
                                      key={experience.id}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {experience.name}
                                    </Badge>
                                  ))}
                              </div>
                            )}

                            <h3 className="text-2xl font-semibold text-gray-900 mb-2 hover:text-teal-600 transition-colors">
                              {pkg.name}
                            </h3>
                          </div>

                          {pricing && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm text-gray-500">From</p>
                              <p className="text-3xl font-bold text-gray-900">
                                ${pricing.basePrice}
                              </p>
                              <p className="text-xs text-gray-500">
                                per person
                              </p>
                            </div>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {pkg.shortDesc}
                        </p>

                        {/* Package Details */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-200 pt-4">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {pkg.minNights} nights
                          </span>
                          {pkg.maxGuests && (
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              Up to {pkg.maxGuests} guests
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Hotel className="w-4 h-4" />
                            {pkg.accommodation.name}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {location.packages.length >= 6 && (
              <div className="text-center mt-8">
                <Button size="lg" variant="outline">
                  View All Packages
                </Button>
              </div>
            )}
          </section>
        )}

        {/* Activities Section */}
        {location.activities.length > 0 && (
          <section>
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Things to Do
              </h2>
              <p className="text-gray-600 text-lg">
                Activities and experiences available locally
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {location.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="relative aspect-square rounded-2xl overflow-hidden group"
                >
                  {activity.images[0] ? (
                    <Image
                      src={getImageUrl(
                        "activities",
                        activity.coverImage || "placeholder.jpg"
                      )}
                      alt={activity.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-cyan-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-sm md:text-base">
                      {activity.name}
                    </h3>
                    {activity.duration && (
                      <p className="text-white/80 text-xs mt-1">
                        {activity.duration} mins
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}
