// app/locations/page.tsx
//
// Choosing an atoll.
//
// The brief put the transfer comparison table first, before any imagery, on the
// argument that distance is the thing that really shapes a trip. The client
// overruled that on review, and the reasoning holds: leading with a table of
// journey times makes six genuinely different islands look like six rows of
// travel admin, and the page's actual job is to show that they are not
// interchangeable.
//
// So the islands lead, each carrying what distinguishes it — region, what it is
// known for, when to come, what we run there — and the comparison table follows
// as supporting detail. Distance is still on the page, still comparable side by
// side, and still on every island row. It is just no longer the headline.

import type { Metadata } from "next";
import Link from "next/link";
import { getLocationCards, locationsArePhotoRich } from "@/lib/data/locations";
import { getPackageCards } from "@/lib/data/packages";
import { locationsLayout } from "@/lib/design/density";
import {
  locationsEmptyCopy,
  locationsHeading,
  locationsLede,
} from "@/lib/design/inventory";
import { SITE_IMAGES } from "@/lib/design/site-images";
import { getImageUrl } from "@/lib/image-urls";
import { Container, Label, Section } from "@/components/ui";
import { Footer } from "@/components/layout/footer";
import { PageHead } from "@/components/layout/page-head";
import {
  ClosingCta,
  EmptyState,
  PhotoFrame,
  SectionHeading,
  SpecSheet,
  TransferTable,
} from "@/components/patterns";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Locations",
  description:
    "Where you go decides what you see, how long you travel to get there, and roughly what it costs. Here is where we work, and why.",
};

export default async function LocationsPage() {
  const [locations, packages] = await Promise.all([
    getLocationCards(),
    getPackageCards({ includeEnded: false }),
  ]);

  // Cheapest per-person price per island, for the table's last column.
  const fromPrices: Record<string, number | undefined> = {};
  for (const p of packages) {
    if (!p.price) continue;
    const current = fromPrices[p.locationSlug];
    if (current === undefined || p.price.total < current) {
      fromPrices[p.locationSlug] = p.price.total;
    }
  }

  const layout = locationsLayout({
    count: locations.length,
    photoRich: locationsArePhotoRich(locations),
    tilesMin: 5,
  });

  return (
    <main>
      <PageHead
        image={getImageUrl("images", SITE_IMAGES.locationsHead)}
        imageAlt="A Maldivian atoll from the air, reef shelving into deep water"
        eyebrow="Locations"
        title="Twenty-six atolls. They are not interchangeable."
        lede="Where you go decides what you see, how long you travel to get there, and roughly what it costs. Here is where we work, and why."
        nav={{ active: "locations", cta: { label: "Book now", href: "/contact", arrow: true } }}
      />

      <Section flush className="pt-20">
        <Container>
          {/* The heading is derived, not written. It said "Six islands" as a
              literal, which would have started lying the moment staff added a
              seventh or deactivated one — inventory.ts exists precisely so that
              no count on the site is hardcoded.

              With nothing to list, the heading is dropped rather than stacked on
              top of the empty panel: the panel already carries an eyebrow, the
              same sentence and the actions, so keeping both said "More islands
              are on the way." twice in a row. */}
          {locations.length > 0 && (
            <SectionHeading
              eyebrow="Where we work"
              title={locationsHeading(locations.length)}
              lede={locationsLede(locations.length)}
            />
          )}

          {locations.length === 0 ? (
            <EmptyState {...locationsEmptyCopy()} />
          ) : layout === "tiles" ? (
            <>
              <div className="flex flex-wrap gap-6">
                {locations.map((l) => (
                  <Link
                    key={l.slug}
                    href={`/locations/${l.slug}`}
                    className="group flex min-w-0 shrink grow basis-[260px] max-w-[360px] flex-col overflow-hidden rounded-lg border border-ink-200 bg-white transition-[box-shadow,transform] duration-[220ms] ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:shadow-card-hover"
                  >
                    <PhotoFrame
                      src={l.coverImage}
                      bucket="locations"
                      alt={l.name}
                      ratio="4 / 3"
                      sizes="(max-width: 768px) 100vw, 360px"
                      zoom
                    />
                    <div className="flex flex-1 flex-col p-5">
                      {l.region && <Label className="mb-2">{l.region}</Label>}
                      <div className="mb-2.5 text-card-title">{l.name}</div>
                      {l.blurb && (
                        <p className="m-0 mb-[18px] min-h-[63px] text-body-xs leading-[21px] text-ink-700">
                          {l.blurb}
                        </p>
                      )}
                      <div className="mt-auto border-t border-ink-200 pt-4">
                        {l.knownFor && (
                          <div className="mb-2 font-mono text-label-sm uppercase text-teal-deep">
                            {l.knownFor}
                          </div>
                        )}
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-caption text-meta">{l.transfer ?? "—"}</span>
                          <span className="text-caption font-medium text-teal-deep">
                            {l.meta} →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            // Big alternating rows. Two atolls fill the page properly this way;
            // two photo tiles would read as a gap.
            <div className="flex flex-col gap-16">
              {locations.map((l, i) => (
                <div
                  key={l.slug}
                  className="flex flex-wrap items-center gap-12"
                >
                  <PhotoFrame
                    src={l.coverImage}
                    bucket="locations"
                    alt={l.name}
                    ratio="4 / 3"
                    radius="xl"
                    className={`min-w-0 shrink grow basis-[300px] max-h-[420px] ${
                      i % 2 === 1 ? "order-2" : ""
                    }`}
                    sizes="(max-width: 768px) 100vw, 560px"
                  />
                  <div className="min-w-0 shrink grow basis-[340px]">
                    {l.region && <Label className="mb-3.5">{l.region}</Label>}
                    <h2 className="m-0 mb-4 text-[clamp(28px,3.2vw,40px)] font-medium leading-[1.14] tracking-[-0.02em]">
                      {l.name}
                    </h2>
                    {l.blurb && (
                      <p className="m-0 mb-6 max-w-[34em] text-[17px] leading-[27px] text-ink-700">
                        {l.blurb}
                      </p>
                    )}
                    <div
                      className="mb-7 grid gap-x-6"
                      style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
                    >
                      {[
                        { label: "Transfer", value: l.transfer },
                        { label: "Best months", value: l.bestMonths },
                        { label: "Known for", value: l.knownFor },
                        { label: "We run", value: l.meta },
                      ]
                        .filter((c) => c.value)
                        .map((c) => (
                          <div key={c.label} className="border-t border-ink-200 py-3">
                            <div className="mb-0.5 font-mono text-label-sm uppercase text-meta">
                              {c.label}
                            </div>
                            <div className="text-body-xs">{c.value}</div>
                          </div>
                        ))}
                    </div>
                    <Link
                      href={`/locations/${l.slug}`}
                      className="inline-flex h-11 items-center rounded-full border border-ink-200 bg-white px-[22px] text-body-xs font-medium text-ink-900 hover:bg-ink-50"
                    >
                      See {l.name} packages →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* No inventory needed — the questions that matter more than photographs */}
      <Section className="mt-[var(--section-y)] border-t border-ink-200">
        <Container>
          <div className="mb-10 max-w-[620px]">
            <Label className="mb-4">If you&rsquo;re undecided</Label>
            <h2 className="m-0 mb-4 text-[clamp(28px,3.2vw,40px)] font-medium leading-[1.14] tracking-[-0.02em]">
              Pick the atoll by what you want to do.
            </h2>
            <p className="m-0 text-body-l text-ink-700">
              Nearly everyone chooses on photographs. These are the questions that
              matter more.
            </p>
          </div>
          <div className="flex flex-wrap gap-6">
            {[
              {
                eyebrow: "Short on time",
                title: "Stay close to Male'",
                body: "North and South Male' are a twenty-minute speedboat. On a four-night trip, a ninety-minute transfer each way costs you most of a day.",
              },
              {
                eyebrow: "Here for the water",
                title: "Go further out",
                body: "The best diving is in the channels and the far south. The extra flight is worth it if the water is why you came.",
              },
              {
                eyebrow: "Watching the budget",
                title: "Local islands, speedboat transfers",
                body: "A seaplane is several hundred dollars a head before you have slept anywhere. The nearer local islands avoid it entirely.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="min-w-0 shrink grow basis-[240px] max-w-[380px] rounded-lg border border-ink-200 bg-white p-6"
              >
                <div className="mb-4 font-mono text-label uppercase text-teal-deep">
                  {c.eyebrow}
                </div>
                <div className="mb-2 text-heading-s">{c.title}</div>
                <p className="m-0 text-body-s text-ink-700">{c.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="muted" bordered="top">
        <Container>
          <div className="mb-8 max-w-[620px]">
            <Label className="mb-4">The journey, side by side</Label>
            <h2 className="m-0 mb-4 text-[clamp(28px,3.2vw,40px)] font-medium leading-[1.14] tracking-[-0.02em]">
              And how far you&rsquo;d travel.
            </h2>
            <p className="m-0 text-body-l text-ink-700">
              Not the reason to choose an island, but worth knowing before you do:
              the transfer is a real cost in money and in hours, and on a short
              trip a ninety-minute crossing each way takes most of a day.
            </p>
          </div>
          <TransferTable locations={locations} fromPrices={fromPrices} />
        </Container>
      </Section>

      <Section>
        <Container>
          <ClosingCta
            heading="Not sure which of these suits you?"
            lede="Tell us what you want out of the week and we'll point you at the right atoll — same day, from Male'."
            primary={{ label: "See all packages", href: "/packages" }}
            secondary={{ label: "Ask us", href: "/contact" }}
          />
        </Container>
      </Section>

      <Footer />
    </main>
  );
}
