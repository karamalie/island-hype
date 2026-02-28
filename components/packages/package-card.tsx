// components/packages/package-card.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ArrowUpRight,
  Calendar,
  Activity,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PackageWithRelations } from "@/lib/data/packages";
import { getImageUrl } from "@/lib/image-urls";
import Image from "next/image";
interface PackageCardProps {
  package: PackageWithRelations;
  currency: "USD" | "MVR";
}

export function PackageCard({ package: pkg, currency }: PackageCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();

  const hoverDuration = isHovered ? "var(--motion-fast)" : "120ms";
  const hoverTiming = isHovered ? "var(--ease-emphasized)" : "var(--ease-exit)";
  const overlayDuration = isHovered ? "var(--motion-base)" : "180ms";
  const overlayDelay = isHovered ? "40ms" : "0ms";
  const panelDuration = isHovered ? "var(--motion-slow)" : "220ms";
  const panelDelay = isHovered ? "90ms" : "0ms";

  const price = pkg.pricing[0]?.couplePrice || 0;
  const activeOffer = pkg.offers[0];

  // Format price directly in the component
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(currency === "MVR" ? "en-MV" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Link href={`/packages/${pkg.slug}`}>
      <Card
        className={cn(
          "group relative overflow-hidden border-0 bg-white shadow-sm cursor-pointer h-full",
          pkg.isFeatured && "beam-border"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transitionProperty: "transform, box-shadow",
          transitionDuration: hoverDuration,
          transitionTimingFunction: hoverTiming,
          transform: isHovered ? "translateY(-2px)" : "translateY(0px)",
          boxShadow: isHovered
            ? "var(--shadow-soft-xl)"
            : "var(--shadow-soft)",
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {/* Placeholder gradient or actual image */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="w-full h-full"
              style={{
                transitionProperty: "transform",
                transitionDuration: isHovered ? "var(--motion-slow)" : "190ms",
                transitionTimingFunction: isHovered
                  ? "var(--ease-standard)"
                  : "var(--ease-exit)",
                transform: isHovered ? "scale(1.06)" : "scale(1)",
              }}
            >
              <Image
                src={getImageUrl(
                  "packages",
                  pkg.coverImage || "placeholder.jpg"
                )}
                alt={pkg.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>
          {/* Overlay gradient on hover */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            style={{
              transitionProperty: "opacity",
              transitionDuration: overlayDuration,
              transitionTimingFunction: isHovered
                ? "var(--ease-standard)"
                : "var(--ease-exit)",
              transitionDelay: overlayDelay,
            }}
          />

          {/* Featured Badge */}
          {pkg.isFeatured && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="glass-dark text-white border-white/20 backdrop-blur-md">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}

          {/* Offer Badge */}
          {activeOffer && activeOffer.badge && (
            <div className="absolute top-3 right-3 z-10">
              <Badge variant="secondary" className="font-semibold shadow-lg">
                {activeOffer.badge}
              </Badge>
            </div>
          )}

          {/* Favorite Button */}
          <button
            className={cn(
              "absolute top-3 right-3 z-20 p-2 rounded-full glass backdrop-blur-md transition-all duration-200",
              activeOffer && activeOffer.badge && "top-14",
              isFavorite
                ? "text-red-500"
                : "text-white hover:text-red-500 hover:scale-110"
            )}
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
          >
            <Heart
              className="w-5 h-5"
              fill={isFavorite ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </button>

          {/* Glassmorphic Hover Overlay */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col justify-end p-6",
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            style={{
              transitionProperty: "opacity",
              transitionDuration: panelDuration,
              transitionTimingFunction: isHovered
                ? "var(--ease-standard)"
                : "var(--ease-exit)",
              transitionDelay: panelDelay,
            }}
          >
            {/* Glass Card */}
            <div
              className="glass-dark rounded-2xl p-4 backdrop-blur-xl space-y-3 transform transition-transform duration-300"
              style={{
                transform: isHovered ? "translateY(0)" : "translateY(12px)",
                transitionProperty: "transform",
                transitionDuration: panelDuration,
                transitionTimingFunction: isHovered
                  ? "var(--ease-standard)"
                  : "var(--ease-exit)",
                transitionDelay: panelDelay,
              }}
            >
              {/* Experiences */}
              {pkg.experiences.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {pkg.experiences.slice(0, 3).map(({ experience }) => (
                    <Badge
                      key={experience.id}
                      variant="outline"
                      className="text-white border-white/40 text-xs backdrop-blur-sm bg-white/10"
                    >
                      {experience.icon && (
                        <span className="mr-1">{experience.icon}</span>
                      )}
                      {experience.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Quick Info */}
              <div className="flex items-center gap-4 text-white/90 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{pkg.minNights}+ nights</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  <span>{pkg._count.activities} activities</span>
                </div>
              </div>

              {/* Transfer Info */}
              {pkg.location.transferTime && (
                <div className="flex items-center gap-1.5 text-white/80 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {pkg.location.transferTime} min{" "}
                    {pkg.location.transferType?.toLowerCase()}
                  </span>
                </div>
              )}

              {/* View Details Button */}
              <Button
                size="sm"
                className="w-full gap-2 bg-white text-black hover:bg-white/90 font-medium shadow-lg"
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/packages/${pkg.slug}`);
                }}
              >
                View Details
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Title & Location */}
          <div>
            <h3 className="font-semibold text-lg leading-tight mb-1.5 line-clamp-1 text-gray-900 group-hover:text-teal-600 transition-colors">
              {pkg.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
              {pkg.location.name}, {pkg.location.atoll}
            </p>
          </div>

          {/* Description */}
          {pkg.shortDesc && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {pkg.shortDesc}
            </p>
          )}

          {/* Accommodation Type & Duration */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs font-normal text-gray-900 border-gray-300"
            >
              {pkg.accommodation.type.replace("_", " ")}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs font-normal text-gray-900 border-gray-300"
            >
              {pkg.minNights}+ nights
            </Badge>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(price)}
                </span>
                <span className="text-sm text-gray-500">/ couple</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                for {pkg.minNights} nights
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gray-900 transition-colors flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
