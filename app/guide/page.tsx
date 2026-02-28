// app/guide/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/image-urls";
import { Navbar } from "@/components/layout/nav-bar";
import { Footer } from "@/components/layout/footer";
import {
  MapPin,
  Plane,
  Ship,
  Waves,
  Sun,
  Droplets,
  Users,
  Heart,
  Coffee,
  Camera,
  Compass,
  CalendarDays,
  Thermometer,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section - Grid Layout */}
      <section className="border-b-2 border-black">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Left Content */}
          <div className="border-r-2 border-black p-12 lg:p-16 flex flex-col justify-center">
            <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-[1.1]">
              Maldives for
              <br />
              the sense
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-md leading-relaxed">
              Find an experience collective that awakens your senses, brings
              balance, and provides the gift of lifetime memories.
            </p>
            <div>
              <Link href="/packages">
                <Button size="lg" className="rounded-full px-8">
                  Explore Packages
                </Button>
              </Link>
            </div>

            {/* Small Image Grid */}
            <div className="grid grid-cols-2 gap-4 mt-12">
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image
                  src={getImageUrl(
                    "images",
                    "guide/overwater-villas-aerial.jpg"
                  )}
                  alt="Overwater villas"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image
                  src={getImageUrl("images", "guide/island-aerial-heart.jpg")}
                  alt="Island aerial view"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative min-h-[400px] lg:min-h-full">
            <Image
              src={getImageUrl("images", "guide/hero-aerial.jpg")}
              alt="Maldives overwater walkway"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Coordinates Section */}
      <section className="border-b-2 border-black py-8">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-3 text-gray-900">
            <MapPin className="w-6 h-6 text-teal-600" />
            <span className="text-xl font-semibold">3.1058° N, 72.6207° E</span>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Side - Introduction */}
            <div className="lg:col-span-7">
              <p className="text-sm font-semibold text-gray-500 tracking-wider uppercase mb-4">
                INTRODUCTION
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-12 leading-tight">
                Bringing alive the magical
                <br />
                beauty of the indian ocean.
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-600 leading-relaxed">
                    The archipelago&apos;s pristine coral reefs in crystal clear
                    lagoons, white sandy beaches, and abundant marine life have
                    lent to the island nation&apos;s reputation as the
                    quintessential tropical paradise.
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 leading-relaxed">
                    In a destination where one atoll is as stunning as the next,
                    where you stay can make a world of difference. Travelers
                    looking to enhance their Maldivian getaway have a choice of
                    island resorts that will allow them to make the most of
                    their stay.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src={getImageUrl("images", "guide/island-beach-aerial.jpg")}
                  alt="Maldives beach aerial"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Large Image Grid Section */}
      <section className="border-b-2 border-black">
        <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[500px]">
          <div className="relative border-r-2 border-black">
            <Image
              src={getImageUrl("images", "guide/island-resort-wide.jpg")}
              alt="Overwater jetty"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative lg:col-span-2">
            <Image
              src={getImageUrl("images", "guide/overwater-jetty-aerial.jpg")}
              alt="Island resort"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Geography Section */}
      <section className="border-b-2 border-black py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Content */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-8 h-8 text-teal-600" />
                <h2 className="text-4xl font-bold text-gray-900">Geography</h2>
              </div>

              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Understanding Atolls
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                The Maldives consists of <strong>26 natural atolls</strong>{" "}
                comprising approximately <strong>1,192 coral islands</strong>.
                Atolls are ring-shaped coral reefs that encircle lagoons, formed
                millions of years ago from sunken volcanic mountains.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                As ancient volcanoes slowly subsided beneath the Indian Ocean,
                coral polyps built massive reefs on top of these sunken peaks.
                What remained were these spectacular ring-shaped formations
                surrounding turquoise lagoons—the signature feature of the
                Maldives.
              </p>

              {/* Quick Facts */}
              <div className="grid grid-cols-2 gap-4 bg-white rounded-2xl p-6 border-2 border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Atolls</p>
                  <p className="text-2xl font-bold text-gray-900">26</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Islands</p>
                  <p className="text-2xl font-bold text-gray-900">1,192</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Inhabited</p>
                  <p className="text-2xl font-bold text-gray-900">~200</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Land Area</p>
                  <p className="text-2xl font-bold text-gray-900">298 km²</p>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-gray-900 mb-6 mt-12">
                The Indian Ocean
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Located in the heart of the Indian Ocean, the Maldives sits{" "}
                <strong>750km southwest of India</strong> and{" "}
                <strong>400km southwest of Sri Lanka</strong>. The archipelago
                stretches 823km north to south, positioned on the
                Chagos-Laccadive Ridge—an extinct volcanic mountain range.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Crystal-clear turquoise waters surround every island, with
                visibility reaching 20-30 meters during the dry season. The warm
                Indian Ocean (26-30°C year-round) teems with vibrant coral
                reefs, tropical fish, manta rays, whale sharks, and sea turtles.
              </p>
            </div>

            {/* Image & Map */}
            <div className="space-y-6">
              <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-200">
                <Image
                  src={getImageUrl("images", "guide/maldives-map.jpg")}
                  alt="Maldives map location"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-gray-200">
                <Image
                  src={getImageUrl("images", "guide/atoll-formation.jpg")}
                  alt="Atoll ring formation"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Climate & Best Time Section */}
      <section className="border-b-2 border-black py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-3 mb-12">
            <Sun className="w-8 h-8 text-teal-600" />
            <h2 className="text-4xl font-bold text-gray-900">
              Climate & Best Time to Visit
            </h2>
          </div>

          {/* Temperature Info */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 mb-12 border-2 border-teal-100">
            <div className="flex items-start gap-6">
              <Thermometer className="w-12 h-12 text-teal-600 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Year-Round Tropical Paradise
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Maldives enjoys a consistently warm tropical climate with
                  temperatures ranging <strong>24-33°C (75-91°F)</strong>{" "}
                  throughout the year. Temperature rarely falls below 25°C even
                  at night, making it perfect for beach activities any time of
                  year.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Hottest month:</strong> April (up to 32°C) •{" "}
                  <strong>Water temperature:</strong> 26-30°C year-round
                </p>
              </div>
            </div>
          </div>

          {/* Seasons Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 lg:divide-x lg:divide-black/35">
            {/* Dry Season */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 bg-white lg:mr-6">
              <div className="flex items-center justify-between mb-6">
                <Badge className="bg-teal-600 text-white text-sm px-4 py-1">
                  BEST TIME
                </Badge>
                <CalendarDays className="w-6 h-6 text-teal-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Dry Season
              </h3>
              <p className="text-lg font-semibold text-teal-600 mb-6">
                December - April
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Sun className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600 text-sm">
                    Minimal rainfall, low humidity, 8-9 hours daily sunshine
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Waves className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600 text-sm">
                    Calm, crystal-clear seas with 20-30m visibility
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Camera className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600 text-sm">
                    Perfect for beach relaxation, snorkeling, diving,
                    photography
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Peak Months
                </p>
                <p className="text-sm text-gray-600">
                  <strong>January-February:</strong> Driest months
                  <br />
                  <strong>December:</strong> Festive season
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  ⚠️ Highest prices • Most crowded • Book 3-6 months in advance
                </p>
              </div>
            </div>

            {/* Wet Season */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 bg-white lg:ml-6">
              <div className="flex items-center justify-between mb-6">
                <Badge variant="outline" className="text-sm px-4 py-1">
                  BUDGET FRIENDLY
                </Badge>
                <Droplets className="w-6 h-6 text-blue-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Wet Season
              </h3>
              <p className="text-lg font-semibold text-blue-600 mb-6">
                May - November
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Droplets className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600 text-sm">
                    Short intense downpours followed by sunshine (7-8 inches
                    monthly)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Waves className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600 text-sm">
                    Slightly rougher seas but still swimmable, lower visibility
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600 text-sm">
                    Perfect for surfers, budget travelers, manta rays & whale
                    sharks
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Marine Life Bonus
                </p>
                <p className="text-sm text-gray-600">
                  <strong>May-November:</strong> Manta ray & whale shark season
                  <br />
                  <strong>June-September:</strong> Best for Hanifaru Bay (Baa
                  Atoll)
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-teal-600 font-medium">
                  ✓ 20-40% cheaper • Fewer crowds • Better marine encounters
                </p>
              </div>
            </div>
          </div>

          {/* Shoulder Season Note */}
          <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              Shoulder Season (April & November)
            </h4>
            <p className="text-gray-600 text-sm">
              Mix of sunny days and light showers with moderate crowds and
              prices. Good value with decent weather conditions.
            </p>
          </div>
        </div>
      </section>

      {/* People & Culture Section */}
      <section className="border-b-2 border-black py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-0 lg:divide-x lg:divide-black/35">
            {/* Image First */}
            <div className="space-y-6 lg:pr-8">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-gray-200">
                <Image
                  src={getImageUrl("images", "guide/male-mosque.jpg")}
                  alt="Malé Grand Friday Mosque"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-gray-200">
                <Image
                  src={getImageUrl("images", "guide/bodu-beru-performance.jpg")}
                  alt="Traditional Bodu Beru performance"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Image Notes
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                  The Grand Friday Mosque area in Malé is one of the capital&apos;s
                  main landmarks. The Islamic Centre opened in 1984, and the
                  mosque is known as the country&apos;s largest, with capacity for
                  around 5,000 worshippers.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Bodu Beru literally means &quot;big drum.&quot; Traditional
                  drums are made from coconut wood with goatskin drum heads, and
                  performances typically build from a steady opening rhythm to a
                  fast, high-energy crescendo.
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="lg:pl-8">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-teal-600" />
                <h2 className="text-4xl font-bold text-gray-900">
                  People & Culture
                </h2>
              </div>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                The Maldivian People
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Maldivians are warm, family-oriented people of Indo-Aryan
                descent with influences from Arab, African, and Southeast Asian
                traders. The population of 515,000 speaks{" "}
                <strong>Dhivehi</strong> (written in Thaana script), though{" "}
                <strong>English is widely spoken</strong>, especially in tourism
                areas and among younger generations.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
                Religion: Islam
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                The Maldives is a <strong>100% Muslim nation</strong> (Sunni
                Islam), having converted in 1153 AD. Islam is the state religion
                and all citizens must be Muslim. Daily life is regulated by
                Islamic principles with 5 daily prayers—shops close for 10-15
                minutes after each call to prayer.
              </p>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Cultural Highlights
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Coffee className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">
                      <strong>Traditional Bodu Beru:</strong> Drumming and
                      dancing performances (15-20 men)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Coffee className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">
                      <strong>Cuisine:</strong> Fish-based (tuna), coconut, rice
                      — Try Mas Huni (national dish)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Coffee className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">
                      <strong>Crafts:</strong> Intricate lacquerwork, wood
                      carving, woven mats
                    </span>
                  </li>
                </ul>
              </div>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Important: Dress Code & Restrictions
              </h3>

              {/* Resort vs Local Islands */}
              <div className="space-y-4">
                <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-6">
                  <h4 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🏝️</span> Resort/Private Islands
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ Bikinis & swimwear allowed everywhere on beach</li>
                    <li>✓ Alcohol served (resorts have special license)</li>
                    <li>✓ Western standards apply</li>
                    <li className="text-red-600 font-medium">
                      ⚠️ Topless sunbathing banned ($1,000 fine)
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                  <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🏘️</span> Local/Inhabited Islands
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      • <strong>Modest dress required:</strong> Cover shoulders
                      to knees
                    </li>
                    <li>
                      •{" "}
                      <strong>
                        Bikinis ONLY at designated &quot;Bikini Beaches&quot;
                      </strong>
                    </li>
                    <li>• NO alcohol anywhere</li>
                    <li>• NO public displays of affection</li>
                    <li>• NO pork products</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transport Section */}
      <section className="border-b-2 border-black py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-3 mb-12">
            <Plane className="w-8 h-8 text-teal-600" />
            <h2 className="text-4xl font-bold text-gray-900">Getting Around</h2>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Why Transport Matters
            </h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Islands are separated by water</strong> — you cannot drive
              between them. The atolls spread across 823km, creating significant
              distances between destinations. Every transfer must be arranged by
              your resort or guesthouse for a cost.
            </p>
          </div>

          {/* Transport Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Speedboat */}
            <div className="border-2 border-gray-200 rounded-2xl p-6 bg-white">
              <Ship className="w-10 h-10 text-blue-600 mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Speedboat</h4>
              <p className="text-sm text-gray-600 mb-4">
                For nearby islands (North/South Malé Atoll)
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• 15-90 minutes</li>
                <li>• Daytime only</li>
                <li>• Shared or private</li>
              </ul>
            </div>

            {/* Seaplane */}
            <div className="border-2 border-teal-200 rounded-2xl p-6 bg-teal-50">
              <Plane className="w-10 h-10 text-teal-600 mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Seaplane</h4>
              <p className="text-sm text-gray-600 mb-4">
                For islands 30+ minutes away
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• 15-45 minute flights</li>
                <li>• Scenic aerial views</li>
                <li>• 6am-4pm only</li>
                <li>• Weather dependent</li>
              </ul>
            </div>

            {/* Domestic Flight */}
            <div className="border-2 border-gray-200 rounded-2xl p-6 bg-white">
              <Plane className="w-10 h-10 text-purple-600 mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">
                Domestic Flight
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                For far southern atolls
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Fly to atoll airport</li>
                <li>• Then speedboat</li>
                <li>• Most reliable</li>
              </ul>
            </div>

            {/* Public Ferry */}
            <div className="border-2 border-gray-200 rounded-2xl p-6 bg-white">
              <Ship className="w-10 h-10 text-gray-600 mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Public Ferry</h4>
              <p className="text-sm text-gray-600 mb-4">Budget option</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Much cheaper</li>
                <li>• Slower & irregular</li>
                <li>• Island hopping</li>
              </ul>
            </div>
          </div>

          {/* Airport Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border-2 border-gray-200 rounded-2xl p-8 bg-white">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Main International Airport
              </h3>
              <p className="text-gray-600 mb-4">
                <strong>Velana International Airport (MLE)</strong> in Malé
              </p>
              <p className="text-sm text-gray-500">
                Direct flights from Middle East, Asia, Europe via Emirates,
                Qatar Airways, Singapore Airlines, British Airways, Turkish
                Airlines
              </p>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-gray-200">
              <Image
                src={getImageUrl("images", "guide/seaplane-water.jpg")}
                alt="Seaplane on water"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Things to Do Section */}
      <section className="border-b-2 border-black py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-3 mb-12">
            <Compass className="w-8 h-8 text-teal-600" />
            <h2 className="text-4xl font-bold text-gray-900">Things to Do</h2>
          </div>

          {/* Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Diving & Snorkeling */}
            <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white">
              <div className="relative aspect-video">
                <Image
                  src={getImageUrl("images", "guide/snorkeling-reef.jpg")}
                  alt="Snorkeling in coral reef"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Diving & Snorkeling
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  World-class dive sites with 20-50m visibility. Encounter manta
                  rays, whale sharks, reef sharks, and sea turtles.
                </p>
                <p className="text-xs text-teal-600 font-medium">
                  Best: December-April for visibility
                </p>
              </div>
            </div>

            {/* Marine Life */}
            <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white">
              <div className="relative aspect-video">
                <Image
                  src={getImageUrl("images", "guide/manta-ray.jpg")}
                  alt="Manta ray encounter"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Marine Encounters
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Swim with whale sharks and hundreds of manta rays at Hanifaru
                  Bay (UNESCO Biosphere Reserve).
                </p>
                <p className="text-xs text-teal-600 font-medium">
                  Best: May-November in Baa Atoll
                </p>
              </div>
            </div>

            {/* Surfing */}
            <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white">
              <div className="relative aspect-video">
                <Image
                  src={getImageUrl("images", "guide/surfing-waves.jpg")}
                  alt="Surfing in Maldives"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Surfing
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  World-class breaks at Thulusdhoo and Himmafushi. Biggest
                  swells June-September.
                </p>
                <p className="text-xs text-teal-600 font-medium">
                  Season: February-November
                </p>
              </div>
            </div>

            {/* Island Hopping */}
            <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white">
              <div className="relative aspect-video">
                <Image
                  src={getImageUrl("images", "guide/local-island-life.jpg")}
                  alt="Local island life"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Island Hopping
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Visit local inhabited islands, experience authentic Maldivian
                  culture, fishing villages, and markets.
                </p>
                <p className="text-xs text-teal-600 font-medium">
                  Modest dress required
                </p>
              </div>
            </div>

            {/* Bioluminescence */}
            <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white">
              <div className="relative aspect-video">
                <Image
                  src={getImageUrl("images", "guide/sea-of-stars.jpg")}
                  alt="Bioluminescent plankton"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Sea of Stars
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Witness magical bioluminescent plankton creating glowing blue
                  traces in the water at night.
                </p>
                <p className="text-xs text-teal-600 font-medium">
                  Best: June-December
                </p>
              </div>
            </div>

            {/* Sunset Cruises */}
            <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white">
              <div className="relative aspect-video">
                <Image
                  src={getImageUrl("images", "guide/dhoni-sunset.jpg")}
                  alt="Traditional dhoni boat"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Sunset Cruises
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Traditional dhoni boat cruises with dolphin spotting and
                  spectacular sunset views.
                </p>
                <p className="text-xs text-teal-600 font-medium">
                  Year-round activity
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Experience Paradise?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Explore our curated packages and find your perfect Maldivian escape.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/packages">
              <Button
                size="lg"
                className="bg-white text-teal-600 hover:bg-gray-100 rounded-full px-8"
              >
                View All Packages
              </Button>
            </Link>
            <Link href="/locations">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8"
              >
                Explore Locations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
