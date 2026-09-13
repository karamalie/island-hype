// app/packages/[slug]/page.tsx
//
// The detail page's job is to justify the price, and its design problem is the
// inverse of the listing's: it has to feel substantial when a package has three
// photographs and a short stay. So the text sections carry the depth.
//
// Note what is NOT here: a day-by-day itinerary. Island Hype sells fixed packages
// and does not commit to a daily schedule — guests plan their own days. The
// section that would have held one instead lists what there is to do, with the
// price-inclusive ones marked, and drops entirely when nothing is linked (which
// is true for three of the seven packages today).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPackageCards, getPackageDetail } from "@/lib/data/packages";
import { getContactDetails } from "@/lib/data/settings";
import { showRelated } from "@/lib/design/density";
import { SITE_IMAGES } from "@/lib/design/site-images";
import { distinctOfferBadge } from "@/lib/design/offers";
import { Badge, Container, Label, Mark, Section } from "@/components/ui";
import { Footer } from "@/components/layout/footer";
import { NavBar } from "@/components/layout/nav-bar";
import {
  AtAGlance,
  BookingRail,
  ClosingCta,
  FaqRows,
  Gallery,
  PackageCard,
  PhotoFrame,
  OfferPanel,
  PriceBlock,
  StepRows,
} from "@/components/patterns";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageDetail(slug);
  if (!pkg) return { title: "Package not found" };
  return {
    title: pkg.name,
    description: pkg.blurb ?? undefined,
  };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [pkg, contact] = await Promise.all([
    getPackageDetail(slug),
    getContactDetails(),
  ]);
  if (!pkg) notFound();

  const related = showRelated(pkg.relatedCount)
    ? (await getPackageCards({ excludeSlug: slug, includeEnded: false })).slice(0, 3)
    : [];

  const included = pkg.included;

  return (
    <main>
      {/* Solid nav: there is no photograph behind it here, so glass would be
          glass over nothing. */}
      <NavBar surface="solid" active="packages" cta={{ label: "Book now", href: "/contact" }} />

      <Container className="pt-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2.5 text-caption text-meta">
          <Link href="/packages" className="hover:text-ink-900">Packages</Link>
          <span className="text-meta-inverse">/</span>
          <Link href={`/locations/${pkg.locationSlug}`} className="hover:text-ink-900">
            {pkg.locationName}
          </Link>
          <span className="text-meta-inverse">/</span>
          <span className="text-ink-900">{pkg.name}</span>
        </nav>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-8">
          <div className="min-w-0 max-w-[700px]">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Label>{pkg.eyebrow}</Label>
              {pkg.badge && <Badge tone="tint">{pkg.badge}</Badge>}
              {/* Same badge the card showed, so arriving from the listing is
                  continuous. The conditions are in the panel further down, and
                  the chip is dropped when it would only repeat pkg.badge. */}
              {distinctOfferBadge(pkg.badge, pkg.offers[0]) && (
                <Badge tone="offer">
                  {distinctOfferBadge(pkg.badge, pkg.offers[0])}
                </Badge>
              )}
              {pkg.lifecycle === "ended" && <Badge tone="quiet">Ended</Badge>}
              {pkg.lifecycle === "upcoming" && pkg.opens && (
                <Badge tone="quiet">{pkg.opens}</Badge>
              )}
            </div>
            <h1 className="m-0 mb-4 text-[clamp(32px,4.2vw,52px)] font-medium leading-[1.08] tracking-[-0.025em]">
              {pkg.name}
            </h1>
            {pkg.blurb && (
              <p className="m-0 max-w-[34em] text-body-l text-ink-700">{pkg.blurb}</p>
            )}
          </div>
          <PriceBlock price={pkg.price} size="xl" className="shrink-0" />
        </div>
      </Container>

      <Container>
        <Gallery
          images={pkg.images}
          cover={pkg.coverImage}
          bucket="packages"
          name={pkg.name}
        />
      </Container>

      <Container className="pt-14">
        {/* Sticky works inside a flex child — do not wrap the rail in an
            overflow-hidden container. */}
        <div className="flex flex-wrap items-start gap-14">
          <div className="min-w-0 shrink grow basis-[420px]">
            <AtAGlance
              className="mb-10 border-b border-ink-200 pb-10"
              cells={[
                { label: "Location", value: `${pkg.locationName}, ${pkg.atoll}` },
                { label: "Nights", value: `${pkg.nights} nights, ${pkg.nights + 1} days` },
                { label: "Stay", value: pkg.stay },
                { label: "Transfer", value: pkg.transfer ? `${pkg.transfer} each way` : null },
                { label: "Meals", value: pkg.mealPlan },
                { label: "Best months", value: pkg.bestMonths },
              ]}
            />

            {/* Placed in the main column rather than above the booking rail on
                purpose: the rail is sticky, and stacking a tall panel on top of
                it can push the enquiry button off the bottom of a short screen —
                the one element that must always be reachable. */}
            <OfferPanel offers={pkg.offers} className="mb-12" />

            {(pkg.longBlurb || pkg.description) && (
              <div className="mb-12">
                <h2 className="m-0 mb-5 text-[clamp(24px,2.6vw,32px)] font-medium leading-[1.18] tracking-[-0.015em]">
                  What the days look like
                </h2>
                {(pkg.longBlurb ?? pkg.description)
                  .split("\n\n")
                  .filter(Boolean)
                  .map((para: string, i: number) => (
                    <p
                      key={i}
                      className="m-0 mb-4 max-w-[34em] text-[17px] leading-7 text-ink-700 last:mb-0"
                    >
                      {para}
                    </p>
                  ))}
              </div>
            )}

            {/* Suggestions, not a schedule. Drops when nothing is linked. */}
            {pkg.suggestions.length > 0 && (
              <div className="mb-12">
                <div className="mb-6 flex flex-wrap items-baseline justify-between gap-5">
                  <h2 className="m-0 text-[clamp(24px,2.6vw,32px)] font-medium leading-[1.18] tracking-[-0.015em]">
                    What there is to do
                  </h2>
                  <Label>Suggestions</Label>
                </div>
                <div>
                  {pkg.suggestions.map((s, i) => (
                    <div
                      key={s.id}
                      className={`border-t border-ink-200 py-6 ${
                        i === pkg.suggestions.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <div className="mb-2 flex flex-wrap items-baseline gap-3">
                        <span className="text-heading-s">{s.name}</span>
                        <span
                          className={`font-mono text-label-sm uppercase ${
                            s.isIncluded ? "text-teal-deep" : "text-meta"
                          }`}
                        >
                          {s.isIncluded ? "Included" : "Optional"}
                        </span>
                      </div>
                      {s.body && (
                        <p className="m-0 max-w-[34em] text-body-m leading-[26px] text-ink-700">
                          {s.body}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <p className="m-0 mt-5 max-w-[34em] text-body-xs leading-[22px] text-meta">
                  Nothing here is scheduled — the days are yours. These are what
                  people usually do, and what is already in the price.
                </p>
              </div>
            )}

            {/* What the price covers */}
            <div className="mb-12">
              <h2 className="m-0 mb-6 text-[clamp(24px,2.6vw,32px)] font-medium leading-[1.18] tracking-[-0.015em]">
                What the price covers
              </h2>
              <div className="flex flex-wrap gap-10">
                {included.length > 0 && (
                  <div className="min-w-0 shrink grow basis-[260px]">
                    <div className="mb-4 font-mono text-label uppercase text-teal-deep">
                      Included
                    </div>
                    {included.map((item) => (
                      <div
                        key={item}
                        className="flex items-baseline gap-3 border-b border-ink-200 py-3"
                      >
                        <Mark className="text-[12px]" />
                        <span className="text-body-s text-ink-700">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="min-w-0 shrink grow basis-[260px]">
                  <div className="mb-4 font-mono text-label uppercase text-meta">
                    Not included
                  </div>
                  {/* Green tax is no longer asserted here. This list is the same
                      on every package, so stating "Green tax, paid on arrival"
                      told guests it was excluded even on packages where it is
                      not — and there was no way for staff to correct it. It
                      belongs on the Inclusions tab now, under the TAXES
                      category, where it can be put on whichever side is true of
                      that package. What is left here is genuinely true of every
                      package we sell. */}
                  {[
                    "International flights to Male'",
                    "Scuba diving and paid excursions",
                    "Alcohol and premium drinks",
                    "Travel insurance",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-baseline gap-3 border-b border-ink-200 py-3"
                    >
                      <span aria-hidden="true" className="shrink-0 text-[12px] text-meta-inverse">
                        —
                      </span>
                      <span className="text-body-s text-ink-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Getting there */}
            <div className="mb-12">
              <h2 className="m-0 mb-6 text-[clamp(24px,2.6vw,32px)] font-medium leading-[1.18] tracking-[-0.015em]">
                Getting there
              </h2>
              <div className="flex flex-wrap items-start gap-8">
                <PhotoFrame
                  src={SITE_IMAGES.map}
                  bucket="images"
                  alt={`Where ${pkg.locationName} sits in the Maldives`}
                  ratio="1 / 1"
                  radius="xl"
                  className="min-w-0 shrink grow basis-[240px] max-h-[320px]"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
                <div className="min-w-0 shrink grow-[2] basis-[300px]">
                  <StepRows
                    steps={[
                      {
                        label: "Step 01",
                        body: "Land at Velana International, Male'. Someone meets you past customs with your name on a board.",
                      },
                      {
                        label: "Step 02",
                        body: pkg.transfer
                          ? `Straight to the ${pkg.transfer.split(",")[0].toLowerCase()} — the wait is usually short, and there is somewhere to sit.`
                          : "Straight to your transfer — the wait is usually short, and there is somewhere to sit.",
                      },
                      {
                        label: "Step 03",
                        body: `${pkg.transfer ?? "The transfer"} to the island, which is the best part of the day. Seaplanes fly in daylight only.`,
                      },
                    ]}
                    note="We book the transfer against your actual flight numbers, so an inbound delay moves it rather than losing it."
                  />
                </div>
              </div>
            </div>

            <FaqRows items={pkg.faqs} />
          </div>

          <div className="min-w-0 shrink basis-[340px] sticky top-6">
            <BookingRail
              packageId={pkg.id}
              packageName={pkg.name}
              price={pkg.price}
              nights={pkg.nights}
              lifecycle={pkg.lifecycle}
              travel={{ start: pkg.travelWindowStart, end: pkg.travelWindowEnd }}
              booking={{ start: pkg.bookingWindowStart, end: pkg.bookingWindowEnd }}
              blackouts={pkg.blackouts}
              maxAdults={pkg.accommodation.maxAdults}
              maxChildren={pkg.accommodation.maxChildren}
              whatsappNumber={contact.phone || null}
            />
          </div>
        </div>
      </Container>

      <Section tone="muted" bordered="top" className="mt-[var(--section-y)]">
        <Container>
          {related.length > 0 ? (
            <>
              <div className="mb-10 max-w-[620px]">
                <Label className="mb-4">Also on the shelf</Label>
                <h2 className="m-0 text-[clamp(28px,3.2vw,40px)] font-medium leading-[1.14] tracking-[-0.02em]">
                  If this one isn&rsquo;t it.
                </h2>
              </div>
              <div className="flex flex-wrap gap-6">
                {related.map((r) => (
                  <PackageCard key={r.id} pkg={r} form="compact" />
                ))}
              </div>
            </>
          ) : (
            // One related card looks like an error, so below two the section
            // changes job entirely.
            <ClosingCta
              framed={false}
              eyebrow="Still deciding"
              heading="Send us your dates and we'll confirm what's open."
              lede="We check availability with the island directly, so you get a real answer rather than a live-inventory guess."
              primary={{ label: "Check these dates", href: "/contact" }}
              secondary={{ label: "See all packages", href: "/packages" }}
            />
          )}
        </Container>
      </Section>

      <Footer />
    </main>
  );
}
