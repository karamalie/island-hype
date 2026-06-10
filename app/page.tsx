// app/page.tsx
import {
  getFeaturedPackages,
  getAccommodations,
  getLocations,
} from "@/lib/data/home";
import {
  HeroCarousel,
  FeaturedPackages,
  HowToBook,
  SectionCarousel,
} from "@/components/home";
import { Footer } from "@/components/layout/footer";

// Rendered at request time on the server (DB is local; not built off-server).
export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch all data in parallel
  const [packages, locations, accommodations] = await Promise.all([
    getFeaturedPackages(),
    getLocations(),
    getAccommodations(),
  ]);

  return (
    <main className="min-h-screen">
      {/* Hero Section with Package Carousel */}
      <HeroCarousel packages={packages} />

      {/* Experiences/Accommodations/Packages Carousel */}
      <SectionCarousel
        locations={locations}
        accommodations={accommodations}
        packages={packages}
      />

      {/* Featured Packages Grid */}
      <FeaturedPackages packages={packages} />

      {/* How to Book Section */}
      <HowToBook />

      {/* Footer */}
      <Footer />
    </main>
  );
}
