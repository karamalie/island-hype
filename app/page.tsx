// app/page.tsx
//
// Home. Ten sections, and the order is an argument: sell the country, establish
// who we are, then sell the packages. The hero sells the place, not a package —
// a specific villa in the hero would answer a question nobody has asked yet.
//
// Two sections here need no inventory at all (the five kinds of night, and how it
// works), and that is deliberate. They are the floor that stops a two-package
// catalogue from putting the footer halfway up the screen.

import type { Metadata } from "next";
import { getPackageCards, openCount } from "@/lib/data/packages";
import { getLocationCards, locationsArePhotoRich } from "@/lib/data/locations";
import { getStayTypes } from "@/lib/data/stay-types";
import { locationsLayout } from "@/lib/design/density";
import { packageCountLine } from "@/lib/design/inventory";
import { SITE_IMAGES } from "@/lib/design/site-images";
import { getImageUrl } from "@/lib/image-urls";
import { Container, Label, Section } from "@/components/ui";
import { Footer } from "@/components/layout/footer";
import { PageHead } from "@/components/layout/page-head";
import {
  ClosingCta,
  EditorialSplit,
  NumberedSteps,
  PackageCard,
  PhotoFrame,
  SectionHeading,
  StayTypeCard,
  TrustBand,
} from "@/components/patterns";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Maldives packages with transfers and meals in one price",
  description:
    "Handpicked Maldives packages — one island, one stay, and the boat or plane that gets you there. Priced per person and in full.",
};

export default async function HomePage() {
  const [featured, locations, stayTypes] = await Promise.all([
    getPackageCards({ featuredOnly: true, includeEnded: false }),
    getLocationCards(),
    getStayTypes(),
  ]);

  const n = openCount(featured);
  const layout = locationsLayout({
    count: locations.length,
    photoRich: locationsArePhotoRich(locations),
    tilesMin: 4,
  });

  return (
    <main>
      <PageHead
        height="hero"
        contained={false}
        image={getImageUrl("images", SITE_IMAGES.homeHero)}
        mobileImage={getImageUrl("images", SITE_IMAGES.homeHeroMobile)}
        imageAlt="A Maldivian atoll and its reef from the air"
        eyebrow="Maldives · stay, transfers and meals in one price"
        title="The water really is that colour."
        lede="Twelve hundred islands, twenty-six atolls, and a reef you can swim to from almost any of them. Pick the one you like — the stay, the transfers and the meals are already in the price."
        nav={{
          active: "home",
          cta: { label: "See packages", href: "/packages", arrow: true },
        }}
      >
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/packages"
            className="inline-flex h-[52px] items-center rounded-full bg-white px-7 text-body-m font-medium text-ink-900 hover:bg-white/90"
          >
            See our packages
          </Link>
          <Link
            href="#how"
            className="glass-light inline-flex h-[52px] items-center rounded-full px-7 text-body-m font-medium text-white hover:bg-white/20"
          >
            How it works
          </Link>
        </div>
      </PageHead>

      <TrustBand
        claims={[
          "Transfers timed to your flight",
          "Every stay seen before we sell it",
          "One price, no resort fees at checkout",
        ]}
        meta="Male', Maldives · same-day replies"
      />

      {/* Why here */}
      <Section>
        <Container>
          <EditorialSplit
            image="left"
            src={SITE_IMAGES.homeWhyHere}
            bucket="images"
            alt="An atoll and its reef from the air"
            eyebrow="Why here"
            title="A country made almost entirely of water."
            body="You don't really travel to the Maldives. You pick one small piece of it and settle in — a single island, a reef off the end of the jetty, and very little reason to leave until the boat comes back."
            rows={[
              { index: "01", text: "Reef within swimming distance of nearly every island" },
              { index: "02", text: "Twenty-eight degrees in the water, most of the year" },
              { index: "03", text: "Four hours from Dubai, nine from London, direct" },
            ]}
            link={{ label: "Read the first-timer's guide", href: "/guide" }}
          />
        </Container>
      </Section>

      {/* What we sell */}
      <Section flush className="pb-[var(--section-y)]">
        <Container>
          <SectionHeading
            eyebrow="What we sell"
            title="Packages, not a booking engine."
            lede="One location, one stay, and the boat or plane that gets you there. Priced per person and in full, so you know both numbers before you ask."
          />
          <div className="flex flex-wrap gap-6">
            {featured.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} form="grid" />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/packages"
              className="inline-flex h-12 items-center rounded-full border border-ink-200 bg-white px-[26px] text-body-s font-medium text-ink-900 hover:bg-ink-50"
            >
              See all packages →
            </Link>
            <span className="text-body-xs text-meta">
              {packageCountLine({ packages: n, locations: locations.length })}
            </span>
          </div>
        </Container>
      </Section>

      {/* What's included */}
      <Section tone="muted" bordered="both">
        <Container>
          <EditorialSplit
            image="right"
            src={SITE_IMAGES.homeIncluded}
            bucket="images"
            alt="A traditional dhoni on the water at sunset"
            eyebrow="What's included"
            title="Your flight lands. Everything after that is ours."
            body="Getting between islands is the part that catches people out — seaplanes fly to their own schedule, and a missed speedboat can cost you a night. So we book it, time it, and put it in the price."
            rows={[
              { text: "Accommodation, picked and visited, never a stock listing" },
              { text: "Seaplane, speedboat or domestic hop — both directions, timed to you" },
              { text: "Meal plan stated on the card, not upsold at the desk" },
            ]}
            link={{ label: "How transfers work", href: "/guide#transfers" }}
          />
        </Container>
      </Section>

      {/* Choose your atoll */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Where you'll be"
            title="Choose your atoll."
            lede="They are genuinely different places. Diving in the far south, sandbanks in the north, and a two-hour difference in how long it takes to reach either."
            aside={
              <Link
                href="/locations"
                className="text-body-s font-medium text-teal-deep hover:text-ink-900"
              >
                All locations →
              </Link>
            }
          />

          {layout === "tiles" ? (
            <div className="flex flex-wrap gap-6">
              {locations.map((l) => (
                <Link
                  key={l.slug}
                  href={`/locations/${l.slug}`}
                  /* Full width inside the gutter on a phone, two-up from 480px.
                     Both halves of that matter. A 180px basis lets two tiles
                     squeeze onto a 430px phone at 183px each, too small to read;
                     but holding one-up all the way to sm (640px) gives a 3:4 tile
                     520px wide and 693px tall, which is worse. 480px is where
                     two tiles first read properly. */
                  className="group min-w-0 basis-full min-[480px]:shrink min-[480px]:grow min-[480px]:basis-[180px] min-[480px]:max-w-[280px]"
                >
                  <PhotoFrame
                    src={l.coverImage}
                    bucket="locations"
                    alt={l.name}
                    ratio="3 / 4"
                    radius="xl"
                    sizes="(max-width: 768px) 50vw, 280px"
                    zoom
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{ background: "var(--scrim-tile)" }}
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="text-heading-s text-white">{l.name}</div>
                      <div className="text-caption text-white">{l.meta}</div>
                    </div>
                  </PhotoFrame>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="grid items-start gap-14"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
            >
              <PhotoFrame
                src={SITE_IMAGES.homeAtolls}
                bucket="images"
                alt="An atoll from the air"
                ratio="1 / 1"
                radius="xl"
                className="min-w-0"
                sizes="(max-width: 768px) 100vw, 560px"
              />
              <div className="min-w-0">
                {locations.map((l, i) => (
                  <Link
                    key={l.slug}
                    href={`/locations/${l.slug}`}
                    className="flex items-baseline gap-5 border-b border-ink-200 py-5"
                  >
                    <span className="shrink-0 font-mono text-label text-teal-bright">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 grow">
                      <span className="mb-1 block text-card-title">{l.name}</span>
                      {l.blurb && (
                        <span className="block text-body-s text-ink-700">{l.blurb}</span>
                      )}
                    </span>
                    <span className="shrink-0 text-caption font-medium text-teal-deep">
                      {l.meta} →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </Section>

      {/* Five kinds of night — zero inventory required */}
      <Section flush className="pb-[var(--section-y)]">
        <Container>
          <div className="mb-10 max-w-[620px]">
            <Label className="mb-4">What you&rsquo;ll sleep in</Label>
            <h2 className="m-0 mb-4 text-display-m">
              A villa on stilts, or a room above a family kitchen.
            </h2>
            <p className="m-0 text-body-l text-ink-700">
              The gap between the cheapest and the most extravagant way to spend a
              night here is enormous — and both are worth doing.
            </p>
          </div>
          <div className="flex flex-wrap gap-6">
            {stayTypes.map((s) => (
              <StayTypeCard key={s.id} stayType={s} />
            ))}
          </div>
        </Container>
      </Section>

      {/* How it works — no deposit percentages, no "we plan it for you" */}
      <Section id="how" tone="muted" bordered="top">
        <Container>
          <div className="mb-12 max-w-[620px]">
            <Label className="mb-4">How it works</Label>
            <h2 className="m-0 mb-4 text-display-m">Pick one. We&rsquo;ll handle the rest.</h2>
            <p className="m-0 text-body-l text-ink-700">
              Four steps, and only one of them is yours to worry about.
            </p>
          </div>
          <NumberedSteps
            steps={[
              {
                title: "You choose a package",
                body: "Location, stay and nights are already decided. Send us your dates and who's travelling.",
              },
              {
                title: "We confirm availability",
                body: "We check the room and the seats with the island directly, then come back with the real total.",
              },
              {
                title: "You pay",
                body: "Once it's confirmed and you're happy with the number, the booking is yours.",
              },
              {
                title: "We sort the transfers",
                body: "Seaplane or speedboat, timed to your flight both ways. You just need to land.",
              },
            ]}
          />
        </Container>
      </Section>

      <Section>
        <Container>
          <ClosingCta
            heading="Found the one? Send us your dates."
            lede="We'll confirm availability with the island and come back the same day."
            primary={{ label: "See all packages", href: "/packages" }}
            secondary={{ label: "WhatsApp us", href: "/contact" }}
          />
        </Container>
      </Section>

      <Footer />
    </main>
  );
}
