// app/packages/page.tsx
//
// The listing. Its job is comparison, so the layout switches on how much there is
// to compare: wide rows at four or fewer, where each row can carry a blurb and a
// three-track spec grid, and a card grid at five and up.
//
// Filter state lives in the URL. When a filter matches nothing, the chip row
// stays above the empty panel so the cause is legible — that is why the filter
// bar is forced visible in the empty state regardless of count.

import type { Metadata } from "next";
import { getPackageCards, getPackageFilterOptions, openCount } from "@/lib/data/packages";
import { packageListDensity } from "@/lib/design/density";
import { resultCount, resultHint } from "@/lib/design/inventory";
import { SITE_IMAGES } from "@/lib/design/site-images";
import { getImageUrl } from "@/lib/image-urls";
import { Container, Label, Section } from "@/components/ui";
import { Footer } from "@/components/layout/footer";
import { PageHead } from "@/components/layout/page-head";
import { NoResults, PackageCard, Toolbar } from "@/components/patterns";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Every Island Hype package is a single island with the boat or plane that gets you there, priced per person and in full.",
};

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const [packages, filters] = await Promise.all([
    getPackageCards({ tagSlug: tag }),
    getPackageFilterOptions(),
  ]);

  const n = openCount(packages);
  const empty = packages.length === 0;
  // The full bar is forced on in the empty state so the chips that caused it stay.
  const density = empty
    ? { layout: "grid" as const, quickPills: false, filterBar: true }
    : packageListDensity(n);

  return (
    <main>
      <PageHead
        image={getImageUrl("images", SITE_IMAGES.packagesHead)}
        imageAlt="An overwater jetty reaching into a lagoon"
        eyebrow="Packages"
        title="Stay, transfers and meals in one price."
        lede="Every one is a single island with the boat or plane that gets you there. Pick the shape of the trip — we'll confirm the dates."
        nav={{ active: "packages", cta: { label: "Book now", href: "/contact", arrow: true } }}
      />

      <Toolbar
        count={resultCount(n, empty)}
        hint={resultHint({ count: n, empty, sorted: n >= 6 })}
        density={density}
        tags={filters.tags}
        activeTag={tag ?? null}
        basePath="/packages"
      />

      <Section flush className="pt-10">
        <Container>
          {empty ? (
            <NoResults
              primary={{ label: "Clear all filters", href: "/packages" }}
              secondary={{ label: "Ask about dates", href: "/contact" }}
            />
          ) : density.layout === "rows" ? (
            <div className="flex flex-col gap-6">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} form="row" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-6">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} form="grid" />
              ))}
            </div>
          )}

          {!empty && (
            // Asks about the packages above, not an offer to build a custom trip.
            <div className="mt-6 flex flex-wrap items-center justify-between gap-6 rounded-lg border border-ink-200 p-6">
              <div className="min-w-0 max-w-[36em]">
                <div className="mb-1.5 text-heading-s">Not sure which month is best?</div>
                <p className="m-0 text-body-xs text-ink-700">
                  Send us the dates you can travel and we&rsquo;ll tell you which of
                  these is at its best then — and what it costs that week.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex h-11 shrink-0 items-center rounded-full border border-ink-200 bg-white px-[22px] text-body-xs font-medium text-ink-900 hover:bg-ink-50"
              >
                Ask about dates
              </Link>
            </div>
          )}
        </Container>
      </Section>

      {/* In every price above — the zero-inventory floor for this page */}
      <Section tone="muted" bordered="top" className="mt-[var(--section-y)]">
        <Container>
          <div className="mb-10 max-w-[620px]">
            <Label className="mb-4">In every price above</Label>
            <h2 className="m-0 mb-4 text-[clamp(28px,3.2vw,40px)] font-medium leading-[1.14] tracking-[-0.02em]">
              The number on the card is the number.
            </h2>
            <p className="m-0 text-body-l text-ink-700">
              Transfers are the part that catches people out, so they are never a
              line item added later.
            </p>
          </div>
          <div className="flex flex-wrap gap-6">
            <IncludedCard
              eyebrow="Included"
              title="Return transfers"
              body="Seaplane, speedboat or domestic hop, booked to meet your flight in both directions."
            />
            <IncludedCard
              eyebrow="Included"
              title="The stated meal plan"
              body="Whatever the card says — breakfast, half-board, all-inclusive — for every night of the stay."
            />
            {/* Not included: the eyebrow drops to meta grey rather than teal. */}
            <IncludedCard
              eyebrow="Not included"
              title="International flights"
              body="You book those, or we'll quote them alongside. Green tax and visa are handled on arrival."
              excluded
            />
          </div>
        </Container>
      </Section>

      <Footer />
    </main>
  );
}

function IncludedCard({
  eyebrow,
  title,
  body,
  excluded = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  excluded?: boolean;
}) {
  return (
    <div className="min-w-0 shrink grow basis-[240px] max-w-[380px] rounded-lg border border-ink-200 bg-white p-6">
      <div
        className={`mb-4 font-mono text-label uppercase ${
          excluded ? "text-meta" : "text-teal-deep"
        }`}
      >
        {eyebrow}
      </div>
      <div className="mb-2 text-heading-s">{title}</div>
      <p className="m-0 text-body-s text-ink-700">{body}</p>
    </div>
  );
}
