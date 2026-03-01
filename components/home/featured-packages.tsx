// components/home/featured-packages.tsx
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { getImageUrl } from "@/lib/image-urls";
import type { FeaturedPackage } from "@/lib/data/home";

interface FeaturedPackagesProps {
  packages: FeaturedPackage[];
}

export function FeaturedPackages({ packages }: FeaturedPackagesProps) {
  // Get price for display
  const getPrice = (pkg: FeaturedPackage) => {
    const intlPricing = pkg.pricing.find((p) => p.market === "INTERNATIONAL");
    return intlPricing ? `$${intlPricing.basePrice}` : "Contact";
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <Badge variant="outline" className="mb-4 text-gray-700">
              Featured
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Popular Packages
            </h2>
          </div>
          <Link href="/packages">
            <Button variant="outline" className="gap-2 text-gray-900">
              View All Packages
              <Icons.arrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.slice(0, 3).map((pkg, index) => {
            const isFeatured = index === 1; // Middle card is featured

            return (
              <Link key={pkg.id} href={`/packages/${pkg.slug}`} className="block">
                <Card
                  variant="clean-elevated"
                  hover
                  className={isFeatured ? "ring-2 ring-teal-500" : ""}
                >
                  <div className="relative h-56">
                    <Image
                      src={getImageUrl(
                        "packages",
                        pkg.coverImage || "placeholder.jpg"
                      )}
                      alt={pkg.name}
                      fill
                      className="object-cover"
                    />
                    {isFeatured && (
                      <Badge variant="primary" className="absolute top-4 left-4">
                        Most Popular
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Icons.mapPin className="w-4 h-4" />
                      {pkg.location?.atoll || "Maldives"}
                    </p>
                    <h3 className="text-xl font-semibold mt-2 text-gray-900">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {pkg.shortDesc}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Icons.clock className="w-4 h-4" />
                        {pkg.minNights} Nights
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">From </span>
                        <span className="text-xl font-bold text-gray-900">
                          {getPrice(pkg)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
