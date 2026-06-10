// app/packages/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  MapPin,
  Star,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { getImageUrl } from "@/lib/image-urls";
import { getPackageBySlug } from "@/lib/data/packages";
import type { Market } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { BookingCard } from "@/components/packages/booking-card";
import { PackageGallery } from "@/components/packages/package-gallery";
import { ItineraryDay } from "@/components/packages/itinerary-day";
import { Footer } from "@/components/layout/footer";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getMarket(): Promise<Market> {
  const cookieStore = await cookies();
  const marketCookie = cookieStore.get("market");
  return (marketCookie?.value as Market) || "INTERNATIONAL";
}

// Rendered at request time on the server (DB is local; not built off-server).
export const dynamic = "force-dynamic";

export default async function PackageDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const market = await getMarket();

  const pkg = await getPackageBySlug(slug, market);

  if (!pkg) {
    notFound();
  }

  // Get pricing for current market
  const pricing = pkg.pricing.find((p) => p.market === market);
  const currency = market === "LOCAL" ? "MVR" : "USD";

  // Format price

  // Calculate rating (placeholder - you can add real ratings later)
  const rating = 4.5;

  // Separate included and optional activities
  const optionalActivities = pkg.activities.filter((a) => !a.isIncluded);

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
              href="/packages"
              className="text-gray-600 hover:text-gray-900"
            >
              Tour Packages
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{pkg.name}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="border-b border-gray-200 bg-maldives-sand-lagoon">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="flex items-center gap-2 text-gray-700 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">
              {pkg.location.name}, {pkg.location.atoll}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
            {pkg.name}
          </h1>

          <div className="flex items-center flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-gray-900 font-semibold">{rating}</span>
            </div>

            {pkg.isFeatured && (
              <Badge className="bg-teal-600 text-white border-0">
                Featured Package
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-200">
                  <Image
                    src={getImageUrl(
                      "packages",
                      pkg.coverImage || "placeholder.jpg"
                    )}
                    alt={pkg.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {pkg.description}
                </p>
              </div>

              {/* Quick Info */}
              {pkg.location.transferTime && (
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <span className="text-sm">
                      {pkg.location.transferTime} min{" "}
                      {pkg.location.transferType?.toLowerCase()} from Malé
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <span className="text-sm">
                      {pkg.minNights}-{pkg.maxNights || pkg.minNights} nights
                    </span>
                  </div>
                  {pkg.maxGuests && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-5 h-5 text-teal-600" />
                      <span className="text-sm">
                        Up to {pkg.maxGuests} guests
                      </span>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Highlights */}
            {pkg.highlights.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Highlights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pkg.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      </div>
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery */}
            {pkg.images.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Gallery
                </h2>
                <PackageGallery images={pkg.images} packageName={pkg.name} />
              </section>
            )}

            {/* What's Included */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What&apos;s Included In Your Tour Plan
              </h2>
              <div className="space-y-3">
                {pkg.inclusions.map((inclusion) => (
                  <div key={inclusion.id} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-800">{inclusion.item}</span>
                      {inclusion.details && (
                        <p className="text-sm text-gray-600 mt-1">
                          {inclusion.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Itinerary */}
            {pkg.itinerary.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Day by Day Itinerary
                </h2>
                <div className="space-y-4">
                  {pkg.itinerary
                    .sort((a, b) => a.dayNumber - b.dayNumber)
                    .map((day) => (
                      <ItineraryDay key={day.id} day={day} />
                    ))}
                </div>
              </section>
            )}

            {/* Optional Activities */}
            {optionalActivities.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Optional Activities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {optionalActivities.map(({ activity }) => (
                    <div
                      key={activity.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-teal-500 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {activity.name}
                      </h3>
                      {activity.description && (
                        <p className="text-sm text-gray-600">
                          {activity.description}
                        </p>
                      )}
                      {activity.duration && (
                        <p className="text-xs text-gray-500 mt-2">
                          Duration: {activity.duration} hours
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Terms & Cancellation */}
            {(pkg.terms || pkg.cancellationPolicy) && (
              <section className="border-t border-gray-200 pt-12">
                {pkg.terms && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Terms & Conditions
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line">
                      {pkg.terms}
                    </p>
                  </div>
                )}
                {pkg.cancellationPolicy && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Cancellation Policy
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line">
                      {pkg.cancellationPolicy}
                    </p>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingCard
                price={pricing?.couplePrice || pricing?.basePrice || 0}
                currency={currency}
                minNights={pkg.minNights}
                maxGuests={pkg.maxGuests}
                packageSlug={pkg.slug}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
