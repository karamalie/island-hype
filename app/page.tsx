// app/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { Icons } from "@/components/ui/icons";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Preview */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background Image Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-cyan-500 to-blue-600" />
        <div className="absolute inset-0 bg-black/20" />

        {/* Glass Navigation */}
        <nav className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="glass rounded-full px-2 py-2 flex items-center gap-1">
            <Button
              variant="glass"
              size="sm"
              className="rounded-full bg-white text-black"
            >
              Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              Experiences
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              Packages
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              Locations
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              Contact
            </Button>
          </div>
        </nav>

        {/* Book Now Button */}
        <div className="absolute top-6 right-8 z-50">
          <Button variant="glass" className="text-white gap-2">
            Book Now
            <Icons.arrowUpRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Hero Content */}
        <Container className="relative z-10 h-full flex flex-col justify-center">
          <Badge
            variant="glass"
            className="mb-6 w-fit text-white border-white/20"
          >
            Experience the Magic of Maldives
          </Badge>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white max-w-4xl leading-tight">
            Unforgettable
            <br />
            <span className="italic">Maldives</span> Escape
          </h1>

          {/* Tour Info Card */}
          <div className="mt-12 max-w-sm">
            <h3 className="text-white text-xl font-semibold">
              Whale Shark Explorer
            </h3>
            <p className="text-white/70 text-sm mt-1">5 Days, 4 Nights</p>

            <div className="flex items-center gap-3 mt-4">
              <AvatarGroup>
                <Avatar
                  size="sm"
                  fallback="JD"
                  className="bg-teal-500 text-white border-white"
                />
                <Avatar
                  size="sm"
                  fallback="AS"
                  className="bg-blue-500 text-white border-white"
                />
                <Avatar
                  size="sm"
                  fallback="MK"
                  className="bg-purple-500 text-white border-white"
                />
              </AvatarGroup>
              <span className="text-white/70 text-sm">+32 People Joined</span>
            </div>

            <p className="text-white/60 text-sm mt-4 leading-relaxed">
              Immerse yourself in the stunning beauty of Dhigurah with our
              iconic Whale Shark Adventure Tour
            </p>

            <Button className="mt-6 gap-2">
              Book Now
              <Icons.arrowUpRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Pagination */}
          <div className="absolute bottom-12 left-8 text-white">
            <span className="text-5xl font-light">01</span>
            <span className="text-xl text-white/50">/05</span>
          </div>
        </Container>

        {/* Carousel Cards Preview (right side) */}
        <div className="absolute bottom-20 right-8 flex gap-4 z-10">
          <Card variant="glass" className="w-48 h-64 overflow-hidden">
            <div className="h-full bg-gradient-to-br from-orange-400 to-pink-500 p-4 flex flex-col justify-end">
              <p className="text-white font-medium text-sm">Sunset Cruise</p>
              <p className="text-white/70 text-xs">02:30</p>
            </div>
          </Card>
          <Card
            variant="glass"
            className="w-36 h-52 overflow-hidden opacity-80"
          >
            <div className="h-full bg-gradient-to-br from-blue-400 to-cyan-500" />
          </Card>
          <Card
            variant="glass"
            className="w-28 h-44 overflow-hidden opacity-60"
          >
            <div className="h-full bg-gradient-to-br from-teal-400 to-green-500" />
          </Card>
        </div>
      </section>

      {/* Design System Preview */}
      <Section className="bg-[var(--bg-secondary)]">
        <Container>
          <h2 className="text-3xl font-bold mb-8">Design System Preview</h2>

          {/* Buttons */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="dark">Dark</Button>
              <Button size="lg" className="gap-2">
                Book Now <Icons.arrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-4">Badges</h3>
            <div className="flex flex-wrap gap-4">
              <Badge>Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Accent</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          {/* Cards */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-4">Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <h4 className="font-semibold">Default Card</h4>
                </CardHeader>
                <CardContent>
                  <p className="text-[var(--text-secondary)]">
                    This is the default card style with border.
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <h4 className="font-semibold">Elevated Card</h4>
                </CardHeader>
                <CardContent>
                  <p className="text-[var(--text-secondary)]">
                    This card has shadow elevation.
                  </p>
                </CardContent>
              </Card>

              <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-6 rounded-2xl">
                <Card variant="glass" className="h-full">
                  <CardHeader>
                    <h4 className="font-semibold">Glass Card</h4>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[var(--text-secondary)]">
                      Glassmorphism effect.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-4">Inputs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
              <Input placeholder="Default input" />
              <Input variant="outline" placeholder="Outline input" />
              <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-4 rounded-xl">
                <Input
                  variant="glass"
                  placeholder="Glass input"
                  className="text-white placeholder:text-white/50"
                />
              </div>
            </div>
          </div>

          {/* Icon Buttons */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-4">Icon Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <IconButton>
                <Icons.arrowLeft className="w-5 h-5" />
              </IconButton>
              <IconButton>
                <Icons.arrowRight className="w-5 h-5" />
              </IconButton>
              <IconButton variant="outline">
                <Icons.heart className="w-5 h-5" />
              </IconButton>
              <IconButton variant="ghost">
                <Icons.share className="w-5 h-5" />
              </IconButton>
            </div>
          </div>

          {/* Typography */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-4">Typography</h3>
            <div className="space-y-4">
              <h1 className="font-display text-6xl">
                Display Heading (Playfair)
              </h1>
              <h1 className="font-display text-6xl italic">Display Italic</h1>
              <h2 className="text-4xl font-bold">Bold Heading (Geist)</h2>
              <p className="text-lg text-[var(--text-secondary)]">
                Body text in secondary color for descriptions and supporting
                content.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* How to Book Section Preview */}
      <Section className="bg-[var(--bg-primary)]">
        <Container>
          {/* Marquee */}
          <div className="overflow-hidden mb-16">
            <div className="animate-marquee flex gap-8 whitespace-nowrap">
              {[
                "Transportation",
                "Exploration",
                "Tour Guide",
                "Adventure",
                "Sunrise Viewing",
                "Mountain",
                "Diving",
                "Snorkeling",
                "Honeymoon",
                "Wellness",
              ].map((item, i) => (
                <span
                  key={i}
                  className="flex items-center gap-4 text-2xl font-light text-[var(--text-tertiary)]"
                >
                  <Icons.sparkle className="w-4 h-4 text-[var(--color-primary-400)]" />
                  {item}
                </span>
              ))}
              {[
                "Transportation",
                "Exploration",
                "Tour Guide",
                "Adventure",
                "Sunrise Viewing",
                "Mountain",
                "Diving",
                "Snorkeling",
                "Honeymoon",
                "Wellness",
              ].map((item, i) => (
                <span
                  key={`dup-${i}`}
                  className="flex items-center gap-4 text-2xl font-light text-[var(--text-tertiary)]"
                >
                  <Icons.sparkle className="w-4 h-4 text-[var(--color-primary-400)]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold mb-16">
            How to Book Your Tour
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Info */}
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-bold mb-4">4 Easy Steps</h3>
              <p className="text-[var(--text-secondary)] mb-8">
                Booking your Maldives adventure is easy and straightforward.
                Follow these four simple steps to secure your unforgettable
                experience.
              </p>
              <Button className="gap-2">
                Book Our Tour
                <Icons.arrowUpRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Steps Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border-color)]">
              {[
                {
                  num: "01",
                  title: "Choose Package",
                  desc: "Visit our website and explore the various tour packages we offer. Select the one that best suits your interests.",
                },
                {
                  num: "02",
                  title: "Confirm Availability",
                  desc: "Check the availability for your preferred tour dates. Contact us and our customer service team will assist you.",
                },
                {
                  num: "03",
                  title: "Make a Reservation",
                  desc: "Once you've confirmed availability, fill out our online reservation form, including the chosen package and date.",
                },
                {
                  num: "04",
                  title: "Receive Confirmation",
                  desc: "After your payment is processed, you'll receive a booking confirmation via email with all the necessary details.",
                },
              ].map((step) => (
                <div key={step.num} className="bg-[var(--bg-primary)] p-8">
                  <span className="text-4xl font-light text-[var(--text-tertiary)]">
                    {step.num}.
                  </span>
                  <h4 className="text-xl font-bold mt-4 mb-3">{step.title}</h4>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Footer Preview */}
      <footer className="bg-[var(--color-gray-950)] text-white py-16">
        <Container>
          {/* Newsletter */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-12 border-b border-white/10">
            <div>
              <h3 className="text-3xl font-bold">Book Your Tour Today!</h3>
              <p className="text-white/60 mt-2">
                Join us for an unforgettable Maldives adventure
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                variant="outline"
                placeholder="Enter your email"
                className="bg-transparent border-white/20 text-white placeholder:text-white/40 md:w-64"
              />
              <Button
                variant="secondary"
                className="bg-white text-black hover:bg-white/90"
              >
                Subscribe
              </Button>
            </div>
          </div>

          {/* Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-12">
            {/* Brand */}
            <div>
              <h2 className="text-2xl font-display italic mb-4">Island Hype</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Discover the awe-inspiring beauty of the Maldives with our
                exclusive tour packages. Experience paradise like never before.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-sm mt-4 hover:text-white/80"
              >
                More About us <Icons.arrowUpRight className="w-4 h-4" />
              </a>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-3 text-white/60">
                <li>
                  <a href="#" className="hover:text-white">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Experiences
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Packages
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Locations
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3 text-white/60">
                <li>+960 123 4567</li>
                <li>hello@islandhype.mv</li>
              </ul>
              <h4 className="font-semibold mt-6 mb-4">Location</h4>
              <p className="text-white/60 text-sm">
                Island Hype Tours
                <br />
                Malé, Maldives
              </p>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Company & Legal</h4>
              <ul className="space-y-3 text-white/60">
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10">
            <div className="flex gap-4">
              <IconButton
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Icons.facebook className="w-4 h-4" />
              </IconButton>
              <IconButton
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Icons.instagram className="w-4 h-4" />
              </IconButton>
              <IconButton
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Icons.twitter className="w-4 h-4" />
              </IconButton>
              <IconButton
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Icons.linkedin className="w-4 h-4" />
              </IconButton>
              <IconButton
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Icons.youtube className="w-4 h-4" />
              </IconButton>
            </div>
            <p className="text-white/40 text-sm">
              © 2026 Island Hype Maldives. All Rights Reserved
            </p>
          </div>
        </Container>
      </footer>
    </main>
  );
}
