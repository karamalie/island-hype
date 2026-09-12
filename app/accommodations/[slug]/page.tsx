// app/accommodations/[slug]/page.tsx
//
// One island. Same shape as the package detail, different content — and one
// deliberate difference in tone: the overview includes the drawbacks. Saying the
// buildings are showing their age, or that this is the wrong island if you want
// marble and a butler, is what makes the rest of the page believable.
//
// The rail quotes the package price, not a room rate, because rooms are not sold
// standalone. The closing band says so outright.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getStayDetail } from "@/lib/data/accommodations";
import {
  accommodationPackagesCta,
  accommodationPackagesHeading,
} from "@/lib/design/inventory";
import { formatMoney } from "@/lib/design/pricing";
import { Badge, Container, Label, Mark, Section } from "@/components/ui";
import { Footer } from "@/components/layout/footer";
import { NavBar } from "@/components/layout/nav-bar";
import { AtAGlance, FaqRows, Gallery } from "@/components/patterns";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const stay = await getStayDetail(slug);
  if (!stay) return { title: "Stay not found" };
  return { title: stay.name, description: stay.blurb ?? undefined };
}

export default async function AccommodationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const stay = await getStayDetail(slug);
  if (!stay) notFound();

  return (
    <main>
      <NavBar surface="solid" active="stays" cta={{ label: "Book now", href: "/contact" }} />

      <Container className="pt-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2.5 text-caption text-meta">
          <Link href="/accommodations" className="hover:text-ink-900">Stays</Link>
          <span className="text-meta-inverse">/</span>
          <Link href={`/locations/${stay.islandSlug}`} className="hover:text-ink-900">
            {stay.islandName}
          </Link>
          <span className="text-meta-inverse">/</span>
          <span className="text-ink-900">{stay.name}</span>
        </nav>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-8">
          <div className="min-w-0 max-w-[700px]">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Label>{stay.islandName}</Label>
              <Badge tone="tint">{stay.typeLabel}</Badge>
            </div>
            <h1 className="m-0 mb-4 text-[clamp(32px,4.2vw,52px)] font-medium leading-[1.08] tracking-[-0.025em]">
              {stay.name}
            </h1>
            {stay.blurb && (
              <p className="m-0 max-w-[34em] text-body-l text-ink-700">{stay.blurb}</p>
            )}
          </div>
          <div className="shrink-0">
            {stay.nightlyFrom !== null ? (
              <>
                <div>
                  <span className="text-[32px] font-semibold leading-[38px]">
                    {formatMoney(stay.nightlyFrom, "USD")}
                  </span>
                  <span className="text-body-xs text-meta"> / night</span>
                </div>
                <div className="mt-1 text-body-xs text-meta">{stay.packagesLine}</div>
              </>
            ) : (
              <div className="text-body-xs text-meta">{stay.packagesLine}</div>
            )}
          </div>
        </div>
      </Container>

      <Container>
        <Gallery
          images={stay.images}
          cover={stay.coverImage}
          bucket="accommodations"
          name={stay.name}
        />
      </Container>

      <Container className="pt-14">
        <div className="flex flex-wrap items-start gap-14">
          <div className="min-w-0 shrink grow basis-[420px]">
            <AtAGlance
              className="mb-10 border-b border-ink-200 pb-10"
              cells={[
                { label: "Island", value: stay.islandName },
                { label: "Transfer", value: stay.transfer },
                { label: "Rooms", value: stay.rooms },
                { label: "Board", value: stay.board },
                { label: "House reef", value: stay.houseReef },
                { label: "Suits", value: stay.suits },
              ]}
            />

            <div className="mb-12">
              <h2 className="m-0 mb-5 text-[clamp(24px,2.6vw,32px)] font-medium leading-[1.18] tracking-[-0.015em]">
                What it&rsquo;s like to stay here
              </h2>
              {stay.description
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

            {stay.roomTypes.length > 0 && (
              <div className="mb-12">
                <div className="mb-6 flex flex-wrap items-baseline justify-between gap-5">
                  <h2 className="m-0 text-[clamp(24px,2.6vw,32px)] font-medium leading-[1.18] tracking-[-0.015em]">
                    The rooms
                  </h2>
                  <Label>
                    {stay.roomTypes.length} room {stay.roomTypes.length === 1 ? "type" : "types"}
                  </Label>
                </div>
                <div>
                  {stay.roomTypes.map((r, i) => (
                    <div
                      key={r.id}
                      className={`border-t border-ink-200 py-6 ${
                        i === stay.roomTypes.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-4">
                        <span className="text-heading-s">{r.name}</span>
                        {r.nightlyFrom !== null && (
                          <span>
                            <span className="text-[18px] font-semibold leading-6">
                              {formatMoney(r.nightlyFrom, "USD")}
                            </span>
                            <span className="text-caption text-meta"> / night</span>
                          </span>
                        )}
                      </div>
                      {r.blurb && (
                        <p className="m-0 mb-4 max-w-[34em] text-body-s text-ink-700">
                          {r.blurb}
                        </p>
                      )}
                      <div
                        className="grid gap-5"
                        style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
                      >
                        {[
                          { label: "Size", value: r.size },
                          { label: "Sleeps", value: r.sleeps },
                          { label: "Access", value: r.access },
                        ]
                          .filter((c) => c.value)
                          .map((c) => (
                            <div key={c.label} className="min-w-0">
                              <div className="mb-0.5 font-mono text-label-sm uppercase text-meta">
                                {c.label}
                              </div>
                              <div className="text-body-xs">{c.value}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stay.facilityGroups.length > 0 && (
              <div className="mb-12">
                <h2 className="m-0 mb-6 text-[clamp(24px,2.6vw,32px)] font-medium leading-[1.18] tracking-[-0.015em]">
                  On the island
                </h2>
                <div className="flex flex-wrap gap-10">
                  {stay.facilityGroups.map((g) => (
                    <div key={g.group} className="min-w-0 shrink grow basis-[240px]">
                      <div className="mb-4 font-mono text-label uppercase text-teal-deep">
                        {g.group}
                      </div>
                      {g.items.map((item) => (
                        <div
                          key={item}
                          className="flex items-baseline gap-3 border-b border-ink-200 py-3"
                        >
                          <Mark className="text-[12px]" />
                          <span className="text-body-s text-ink-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {/* What is absent, said plainly. */}
                {stay.absentNote && (
                  <p className="m-0 mt-5 max-w-[34em] text-body-xs leading-[22px] text-meta">
                    {stay.absentNote}
                  </p>
                )}
              </div>
            )}

            <FaqRows items={stay.faqs} />
          </div>

          <div className="min-w-0 shrink basis-[340px] sticky top-6">
            <div className="rounded-lg border border-ink-200 bg-white p-6 shadow-card-hover">
              <div className="mb-3 font-mono text-label-sm uppercase text-meta">
                Sold as a package
              </div>
              {stay.nightlyFrom !== null && (
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span>
                    <span className="text-price-lg">
                      {formatMoney(stay.nightlyFrom, "USD")}
                    </span>
                    <span className="text-caption text-meta"> / night</span>
                  </span>
                </div>
              )}
              <div className="mb-5 text-caption text-meta">
                {stay.transfer ? `${stay.transfer} and meals included` : "Transfers and meals included"}
              </div>

              {stay.packageSlug ? (
                <Link
                  href={`/packages/${stay.packageSlug}`}
                  className="mb-2 flex h-[52px] w-full items-center justify-center rounded-full bg-ink-900 text-body-m font-medium text-white hover:bg-ink-800"
                >
                  {accommodationPackagesCta(stay.packageCount)}
                </Link>
              ) : (
                <Link
                  href="/packages"
                  className="mb-2 flex h-[52px] w-full items-center justify-center rounded-full bg-ink-900 text-body-m font-medium text-white hover:bg-ink-800"
                >
                  See all packages
                </Link>
              )}
              <Link
                href="/contact"
                className="mb-5 flex h-12 w-full items-center justify-center rounded-full border border-ink-200 bg-white text-body-s font-medium text-ink-900 hover:bg-ink-50"
              >
                Ask about a room
              </Link>

              <div className="border-t border-ink-200 pt-5">
                <div className="mb-2.5 flex items-baseline gap-2.5">
                  <Mark className="text-[11px]" />
                  <span className="text-caption leading-5 text-ink-700">
                    We have stayed here — ask us anything specific
                  </span>
                </div>
                <div className="flex items-baseline gap-2.5">
                  <Mark className="text-[11px]" />
                  <span className="text-caption leading-5 text-ink-700">
                    Room and seats confirmed with the island before you pay
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Section tone="muted" bordered="top" className="mt-[var(--section-y)]">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="min-w-0 max-w-[30em]">
              <Label className="mb-4">How to book it</Label>
              <h2 className="m-0 mb-4 text-[clamp(28px,3.2vw,40px)] font-medium leading-[1.14] tracking-[-0.02em]">
                {accommodationPackagesHeading(stay.packageCount)}
              </h2>
              <p className="m-0 text-body-l text-ink-700">
                We do not sell rooms on their own — the transfer is the hard part and
                it belongs in the price.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={stay.packageSlug ? `/packages/${stay.packageSlug}` : "/packages"}
                className="inline-flex h-[52px] items-center rounded-full bg-ink-900 px-7 text-body-m font-medium text-white hover:bg-ink-800"
              >
                {accommodationPackagesCta(stay.packageCount)}
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-[52px] items-center rounded-full border border-ink-200 bg-white px-7 text-body-m font-medium text-ink-900 hover:bg-ink-50"
              >
                Ask about dates
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </main>
  );
}
