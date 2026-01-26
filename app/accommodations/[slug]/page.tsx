// app/accommodations/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Star,
  Wifi,
  Utensils,
  Waves,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Users,
  Sparkles,
  Calendar,
} from "lucide-react";
import { getImageUrl } from "@/lib/image-urls";
import { getAccommodationBySlug } from "@/lib/data/accommodations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/layout/nav-bar";
import { Footer } from "@/components/layout/footer";
import { AccommodationGallery } from "@/components/accommodations/accommodation-gallery";

// Icon mapping for amenities
const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi,
  restaurant: Utensils,
  pool: Waves,
  spa: Sparkles,
};

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function AccommodationDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const accommodation = await getAccommodationBySlug(slug);

  if (!accommodation) {
    notFound();
  }

  // Combine accommodation and location images for gallery
  const allImages = [
    ...accommodation.images.map((img) => ({
      url: getImageUrl("accommodations", img.url),
      alt: img.alt || accommodation.name,
    })),
    ...accommodation.location.images.slice(0, 3).map((img) => ({
      url: getImageUrl("locations", img.url),
      alt: img.alt || accommodation.location.name,
    })),
  ];

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
              href="/accommodations"
              className="text-gray-600 hover:text-gray-900"
            >
              Accommodations
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">
              {accommodation.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Section - Full Width Single Image */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <Image
          src={getImageUrl(
            "accommodations",
            accommodation.coverImage || "placeholder.jpg"
          )}
          alt={accommodation.name}
          fill
          className="object-cover"
          priority
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Star Rating Badge */}
        {accommodation.starRating && (
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg z-10">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-900">
              {accommodation.starRating}
            </span>
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <div className="max-w-7xl mx-auto">
            {/* Badges */}
            <div className="flex items-center gap-3 mb-4">
              <Badge
                variant="glass"
                size="lg"
                className="text-white border-white/20 capitalize"
              >
                {accommodation.type.toLowerCase()}
              </Badge>
              {accommodation.location.atoll && (
                <Badge
                  variant="glass"
                  size="lg"
                  className="text-white border-white/20"
                >
                  {accommodation.location.atoll}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {accommodation.name}
            </h1>

            {/* Location Info */}
            <div className="flex items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{accommodation.location.name}</span>
              </div>
              {accommodation.location.transferTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-lg">
                    {accommodation.location.transferTime} min from Malé
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                About This Property
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                {accommodation.description}
              </p>
            </section>

            {/* Gallery Carousel */}
            {allImages.length > 0 && (
              <AccommodationGallery
                images={allImages}
                accommodationName={accommodation.name}
              />
            )}

            {/* Room Types */}
            {accommodation.roomTypes.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Room Types Available
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accommodation.roomTypes.map((room, index) => (
                    <Card key={index} className="border-0 shadow-sm">
                      <div className="p-6">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {room}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Amenities */}
            {accommodation.amenities.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Amenities & Facilities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accommodation.amenities.map((amenity, index) => {
                    const IconComponent =
                      amenityIcons[amenity.toLowerCase()] || CheckCircle2;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-teal-600" />
                        </div>
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Location Info */}
            <section className="border-t border-gray-200 pt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Location
              </h2>
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {accommodation.location.name}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {accommodation.location.description}
                </p>

                {/* Location Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Atoll</p>
                    <p className="font-medium text-gray-900">
                      {accommodation.location.atoll}
                    </p>
                  </div>
                  {accommodation.location.island && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Island</p>
                      <p className="font-medium text-gray-900">
                        {accommodation.location.island}
                      </p>
                    </div>
                  )}
                  {accommodation.location.transferTime && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Transfer</p>
                      <p className="font-medium text-gray-900">
                        {accommodation.location.transferTime} min{" "}
                        {accommodation.location.transferType?.toLowerCase()}{" "}
                        from Malé Airport
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Available Packages */}
            {accommodation.packages.length > 0 && (
              <section className="border-t border-gray-200 pt-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Available Packages
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {accommodation.packages.map((pkg) => {
                    const pricing = pkg.pricing[0];
                    return (
                      <Link key={pkg.id} href={`/packages/${pkg.slug}`}>
                        <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                          <div className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-teal-600 transition-colors">
                                  {pkg.name}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                  {pkg.shortDesc}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {pkg.minNights} nights
                                  </span>
                                  {pkg.maxGuests && (
                                    <span className="flex items-center gap-1">
                                      <Users className="w-4 h-4" />
                                      Up to {pkg.maxGuests} guests
                                    </span>
                                  )}
                                </div>
                              </div>
                              {pricing && (
                                <div className="text-right">
                                  <p className="text-sm text-gray-500">From</p>
                                  <p className="text-2xl font-bold text-gray-900">
                                    ${pricing.basePrice}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    per person
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-0 shadow-xl">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Get in Touch
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Interested in staying at {accommodation.name}? Contact us
                    for availability, pricing, and special offers.
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-4 mb-8">
                    {accommodation.contactEmail && (
                      <a
                        href={`mailto:${accommodation.contactEmail}`}
                        className="flex items-center gap-3 text-gray-700 hover:text-teal-600 transition-colors"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-teal-600" />
                        </div>
                        <span className="text-sm">
                          {accommodation.contactEmail}
                        </span>
                      </a>
                    )}
                    {accommodation.contactPhone && (
                      <a
                        href={`tel:${accommodation.contactPhone}`}
                        className="flex items-center gap-3 text-gray-700 hover:text-teal-600 transition-colors"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-teal-600" />
                        </div>
                        <span className="text-sm">
                          {accommodation.contactPhone}
                        </span>
                      </a>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <Button className="w-full" size="lg">
                      Request Availability
                    </Button>
                    <Button variant="outline" className="w-full" size="lg">
                      View Packages
                    </Button>
                  </div>

                  {/* Quick Info */}
                  <div className="mt-8 pt-8 border-t border-gray-200 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Response Time</span>
                      <span className="text-gray-900 font-medium">
                        Within 24 hours
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Languages</span>
                      <span className="text-gray-900 font-medium">
                        English, Dhivehi
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
