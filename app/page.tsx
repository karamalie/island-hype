// app/page.tsx
import {
  getFeaturedPackages,
  getExperiences,
  getAccommodations,
} from "@/lib/data/home";
import {
  HeroCarousel,
  ExperiencesCarousel,
  FeaturedPackages,
  HowToBook,
} from "@/components/home";
import { Footer } from "@/components/layout/footer";

export default async function Home() {
  // Fetch all data in parallel
  const [packages, experiences, accommodations] = await Promise.all([
    getFeaturedPackages(),
    getExperiences(),
    getAccommodations(),
  ]);

  return (
    <main className="min-h-screen">
      {/* Hero Section with Package Carousel */}
      <HeroCarousel packages={packages} />

      {/* Experiences/Accommodations/Packages Carousel */}
      <ExperiencesCarousel
        experiences={experiences}
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
