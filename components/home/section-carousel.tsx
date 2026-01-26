// components/home/packages-carousel.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { Icons } from "@/components/ui/icons";
import { Pill, PillGroup } from "@/components/ui/pill";
import { Card } from "@/components/ui/card";
import { getImageUrl, type StorageBucket } from "@/lib/image-urls";
import type { Accommodation, FeaturedPackage, Location } from "@/lib/data/home";

type TabType = "locations" | "accommodations" | "packages";

// Union type for possible items
type CarouselItem = Location | Accommodation | FeaturedPackage;

interface SectionCarouselProps {
  locations: Location[];
  accommodations: Accommodation[];
  packages: FeaturedPackage[];
}

// Type guards to check item type
function isLocation(item: CarouselItem): item is Location {
  return "atoll" in item && !("locationId" in item) && !("minNights" in item);
}

function isAccommodation(item: CarouselItem): item is Accommodation {
  return "locationId" in item && !("minNights" in item);
}

function isPackage(item: CarouselItem): item is FeaturedPackage {
  return "minNights" in item;
}

// Get the correct bucket for each item type
function getBucket(item: CarouselItem): StorageBucket {
  if (isLocation(item)) return "locations";
  if (isAccommodation(item)) return "accommodations";
  if (isPackage(item)) return "packages";
  return "images";
}

export function SectionCarousel({
  locations,
  accommodations,
  packages,
}: SectionCarouselProps) {
  const [activeTab, setActiveTab] = useState<TabType>("locations");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Get current items based on active tab
  const getCurrentItems = (): CarouselItem[] => {
    switch (activeTab) {
      case "locations":
        return locations;
      case "accommodations":
        return accommodations;
      case "packages":
        return packages;
      default:
        return locations;
    }
  };

  const items = getCurrentItems();

  // Get subtitle based on item type
  const getSubtitle = (item: CarouselItem): string => {
    if (isLocation(item)) {
      return `${item.atoll}${item.island ? `, ${item.island}` : ""}`;
    }
    if (isAccommodation(item)) {
      return item.location?.name || "";
    }
    if (isPackage(item)) {
      const price = item.pricing?.[0]?.basePrice;
      return price ? `From $${price}` : "";
    }
    return "";
  };

  // Get image URL with correct bucket
  const getItemImageUrl = (item: CarouselItem): string => {
    const bucket = getBucket(item);
    return getImageUrl(bucket, item.coverImage || "placeholder.jpg");
  };

  // Render item based on type
  const renderItem = (item: CarouselItem, index: number) => {
    // Varying heights for visual interest
    const heights = ["h-96", "h-80", "h-72", "h-96", "h-80"];
    const height = heights[index % heights.length];

    // Every 3rd item gets the card with circular image style
    const isCircularCard = index % 4 === 2;

    if (isCircularCard) {
      return (
        <Card
          key={item.id}
          variant="clean-elevated"
          className="flex-shrink-0 w-64"
        >
          <div className="p-6">
            {/* Circular image */}
            <div className="w-full aspect-square rounded-full overflow-hidden relative mb-4 bg-gradient-to-br from-cyan-100 to-blue-200">
              <Image
                src={getItemImageUrl(item)}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            {/* Info */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">
                  {item.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {item.shortDesc}
                </p>
              </div>
              <IconButton variant="outline" size="sm" className="flex-shrink-0">
                <Icons.arrowUpRight className="w-4 h-4" />
              </IconButton>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <div
        key={item.id}
        className={`flex-shrink-0 w-64 ${height} rounded-3xl overflow-hidden relative group cursor-pointer`}
      >
        <Image
          src={getItemImageUrl(item)}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h4 className="font-semibold">{item.name}</h4>
          <p className="text-sm text-white/80 mt-1">{getSubtitle(item)}</p>
        </div>
      </div>
    );
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          {/* Badge with icon - using "light" variant for white background */}
          <Badge
            variant="light"
            size="lg"
            icon={<Icons.plus className="w-4 h-4" />}
            className="mb-6"
          >
            Tour Activity
          </Badge>

          {/* Two-tone heading */}
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            <span className="text-gray-900">Our Tour Package </span>
            <span className="text-gray-400">Ensures A Seamless</span>
            <br />
            <span className="text-gray-900">And Memorable Adventure.</span>
          </h2>
        </div>

        {/* Filter Pills */}
        <PillGroup className="justify-center mb-12">
          <Pill
            variant={activeTab === "locations" ? "filled" : "outline"}
            onClick={() => setActiveTab("locations")}
          >
            Locations
          </Pill>
          <Pill
            variant={activeTab === "accommodations" ? "filled" : "outline"}
            onClick={() => setActiveTab("accommodations")}
          >
            Accommodations
          </Pill>
          <Pill
            variant={activeTab === "packages" ? "filled" : "outline"}
            onClick={() => setActiveTab("packages")}
          >
            Packages
          </Pill>
        </PillGroup>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 items-end overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          >
            {/* Left fade peek */}
            <div className="flex-shrink-0 w-12 h-64 rounded-3xl overflow-hidden relative opacity-30">
              <div className="w-full h-full bg-gray-200" />
            </div>

            {/* Items */}
            {items.map((item, index) => renderItem(item, index))}

            {/* Right fade peek */}
            <div className="flex-shrink-0 w-20 h-64 rounded-3xl overflow-hidden relative opacity-50">
              <div className="w-full h-full bg-gray-200" />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <IconButton variant="outline" onClick={() => scroll("left")}>
              <Icons.arrowLeft className="w-5 h-5" />
            </IconButton>

            {/* Progress Bar */}
            <div className="w-48 h-0.5 bg-gray-200 rounded-full">
              <div
                className="h-full bg-gray-900 rounded-full transition-all duration-300"
                style={{ width: "33%" }}
              />
            </div>

            <IconButton variant="outline" onClick={() => scroll("right")}>
              <Icons.arrowRight className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
      </div>
    </section>
  );
}
