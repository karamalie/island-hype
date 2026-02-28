// components/home/hero-carousel.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { Icons } from "@/components/ui/icons";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { SlideCounter } from "@/components/ui/slide-counter";
import type { FeaturedPackage } from "@/lib/data/home";
import { getImageUrl } from "@/lib/image-urls";
import { Navbar } from "../layout/nav-bar";

interface HeroCarouselProps {
  packages: FeaturedPackage[];
}

export function HeroCarousel({ packages }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const currentPackage = packages[currentIndex];

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % packages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, packages.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % packages.length);
  }, [currentIndex, packages.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + packages.length) % packages.length);
  }, [currentIndex, packages.length, goToSlide]);

  // Get price display
  const getPrice = (pkg: FeaturedPackage) => {
    const intlPricing = pkg.pricing.find((p) => p.market === "INTERNATIONAL");
    return intlPricing ? `$${intlPricing.basePrice}` : "Contact us";
  };

  // Format nights display
  const getNightsDisplay = (pkg: FeaturedPackage) => {
    return `${pkg.minNights} Nights, ${pkg.minNights + 1} Days`;
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Static Background Image */}
      <div className="absolute inset-0">
        <Image
          src={getImageUrl("images", "hero/maldives-aerial.jpg")}
          alt="Maldives aerial view"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/20" />
      </div>

      {/* Logo */}
      <div className="absolute top-6 left-8 z-50">
        <h1 className="text-2xl font-display italic text-white">Island Hype</h1>
      </div>

      {/* Glass Navigation */}
      <Navbar variant="overlay" showLogo={false} />

      {/* <nav className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-nav px-2 py-2 flex items-center gap-1">
          <Button variant="white" size="sm" className="rounded-full">
            Home
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-full"
          >
            Experiences
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-full"
          >
            Packages
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-full"
          >
            Locations
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-full"
          >
            Contact
          </Button>
        </div>
      </nav> */}

      {/* Book Now Button */}
      {/* <div className="absolute top-6 right-8 z-50 flex items-center gap-2">
        <Button variant="glass" className="text-white gap-2">
          Book Now
        </Button>
        <IconButton variant="glass" size="sm">
          <Icons.arrowUpRight className="w-4 h-4" />
        </IconButton>
      </div> */}

      {/* Main Content Container */}
      <div className="relative z-10 h-screen max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-center">
            {/* Left Content - Changes with carousel */}
            <div className="space-y-6">
              {/* Badge */}
              <Badge variant="glass" size="lg" className="text-white">
                Experience the Magic of Maldives
              </Badge>

              {/* Main Headline */}
              <h2 className="text-white leading-[1.05]">
                <span className="block text-5xl md:text-6xl lg:text-7xl font-light">
                  Unforgettable
                </span>
                <span className="block text-5xl md:text-6xl lg:text-7xl">
                  <span className="font-display italic text-white/90">
                    {currentPackage?.location?.atoll?.split(" ")[0] ||
                      "Maldives"}
                  </span>{" "}
                  <span className="font-light">Escape</span>
                </span>
              </h2>

              {/* Tour Info Card */}
              <div className="mt-8 max-w-sm">
                <h3 className="text-xl font-semibold text-white">
                  {currentPackage?.name || "Loading..."}
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  {currentPackage ? getNightsDisplay(currentPackage) : ""}
                </p>


                <p className="text-white/60 text-sm mt-4 leading-relaxed line-clamp-2">
                  {currentPackage?.shortDesc || "Loading..."}
                </p>

                <div className="flex items-center gap-3 mt-6">
                  <Button variant="white" className="gap-2">
                    Book Now
                  </Button>
                  <IconButton variant="white" size="sm">
                    <Icons.arrowUpRight className="w-5 h-5" />
                  </IconButton>
                </div>
              </div>
            </div>

            {/* Right Content - Image Carousel */}
            <div className="hidden lg:flex items-end justify-end gap-4 h-[500px]">
              {packages.map((pkg, index) => {
                const isActive = index === currentIndex;
                const isNext = index === (currentIndex + 1) % packages.length;
                const isNextNext =
                  index === (currentIndex + 2) % packages.length;

                // Only show current, next, and next-next items
                if (!isActive && !isNext && !isNextNext) return null;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => goToSlide(index)}
                    className={`
                      relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500
                      ${isActive ? "w-56 h-80 opacity-100" : ""}
                      ${isNext ? "w-36 h-56 opacity-90" : ""}
                      ${isNextNext ? "w-28 h-44 opacity-70" : ""}
                    `}
                  >
                    <Image
                      src={getImageUrl(
                        "packages",
                        pkg.coverImage || "placeholder.jpg"
                      )}
                      alt={pkg.name}
                      fill
                      className="object-cover"
                    />

                    {/* Only show overlay content on active card */}
                    {isActive && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-sm">
                                {pkg.location?.name || "View Point"}
                              </h4>
                              <p className="text-xs text-white/70 mt-1 line-clamp-2">
                                {pkg.location?.shortDesc || ""}
                              </p>
                            </div>
                            <span className="text-xs text-white/60">
                              {getPrice(pkg)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-12 left-8 right-8 flex items-end justify-between">
          {/* Slide Counter */}
          <SlideCounter
            current={currentIndex + 1}
            total={packages.length}
            variant="light"
          />

          {/* Progress Bar */}
          <div className="flex-1 max-w-xs mx-auto">
            <div className="h-0.5 bg-white/20 rounded-full">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{
                  width: `${((currentIndex + 1) / packages.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Navigation Arrows (mobile) */}
          <div className="flex gap-2 lg:hidden">
            <IconButton variant="glass" size="sm" onClick={prevSlide}>
              <Icons.arrowLeft className="w-4 h-4" />
            </IconButton>
            <IconButton variant="glass" size="sm" onClick={nextSlide}>
              <Icons.arrowRight className="w-4 h-4" />
            </IconButton>
          </div>
        </div>
      </div>
    </section>
  );
}
