// app/locations/[slug]/page.tsx
//
// One atoll. The specificity is the point: a UNESCO designation, a named bay, and
// why one half of the year is a different trip from the other. Generic island
// copy would make every location page interchangeable, which is exactly the thing
// the index page argues against.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getLocationDetail } from "@/lib/data/locations";
import { getPackageCards } from "@/lib/data/packages";
import { getStayTypesForLocation } from "@/lib/data/stay-types";
import { packagesHereHeading } from "@/lib/design/inventory";
import { Container, Label, Section } from "@/components/ui";
import { Footer } from "@/components/layout/footer";
import { NavBar } from "@/components/layout/nav-bar";
import {
  AtAGlance,
  ClosingCta,
  FaqRows,
  Gallery,
  PackageCard,
  SeasonCalendar,
  SiblingPanel,
  StayTypeCard,
  StepRows,
} from "@/components/patterns";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loc = await getLocationDetail(slug);
  if (!loc) return { title: "Location not found" };
  return { title: loc.name, description: loc.blurb ?? undefined };
}

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loc = await getLocationDetail(slug);
  if (!loc) notFound();

  const [packages, stayTypes] = await Promise.all([
    getPackageCards({ locationSlug: slug, includeEnded: false }),
    getStayTypesForLocation(loc.id),
  ]);

  return (
    <main>
      <NavBar surface="solid" active="locations" cta={{ label: "Book now", href: "/contact" }} />

      <Container className="pt-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2.5 text-caption text-meta">
          <Link href="/locations" className="hover:text-ink-900">Locations</Link>
          <span className="text-meta-inverse">/</span>
          <span className="text-ink-900">{loc.name}</span>
        </nav>

        <div className="mb-8 max-w-[700px]">
          {loc.region && <Label className="mb-4">{loc.region}</Label>}
          <h1 className="m-0 mb-4 text-display-l">{loc.name}</h1>
          {loc.blurb && <p className="m-0 text-body-l text-ink-700">{loc.blurb}</p>}
        </div>
      </Container>

      <Container>
        <Gallery
          images={loc.images}
          cover={loc.coverImage}
          bucket="locations"
          name={loc.name}
        />
      </Container>

      <Container className="pt-14">
        <AtAGlance
          layout="autoFit"
          cells={[
            { label: "Transfer", value: loc.transfer },
            { label: "Best months", value: loc.bestMonths },
            { label: "Known for", value: loc.knownFor },
            { label: "We run", value: loc.meta },
          ]}
        />
      </Container>

      <Container className="pt-14">
        <div className="mb-14 max-w-[34em]">
          <h2 className="m-0 mb-5 text-[clamp(24px,2.6vw,32px)] font-medium leading-[1.18] tracking-[-0.015em]">
            What it&rsquo;s actually like
          </h2>
          {loc.description
            .split("\n\n")
            .filter(Boolean)
            .map((para: string, i: number) => (
              <p key={i} className="m-0 mb-4 text-[17px] leading-7 text-ink-700 last:mb-0">
                {para}
              </p>
            ))}
        </div>

        <div className="mb-14">
          <SeasonCalendar
            season={loc.season}
            highlightLabel={loc.seasonHighlightLabel}
            note="Rain in the wetter months tends to arrive in short heavy bursts rather than all day. Prices drop noticeably out of season."
          />
        </div>

        <div className="mb-14">
          <h2 className="m-0 mb-6 text-[clamp(24px,2.6vw,32px)] font-medium leading-[1.18] tracking-[-0.015em]">
            Getting there
          </h2>
          <StepRows
            steps={[
              {
                label: "Step 01",
                body: "Arrive at Velana International. Transfer desks are past customs; your island will have someone holding a board with your name.",
              },
              {
                label: "Step 02",
                body: loc.transfer
                  ? `Then the ${loc.transfer.split(",")[0].toLowerCase()}. Seaplanes fly to daylight rather than to a timetable, so a wait of an hour or two is normal.`
                  : "Then your transfer. Seaplanes fly to daylight rather than to a timetable, so a wait of an hour or two is normal.",
              },
              {
                label: "Step 03",
                body: loc.transferInfo ?? "The last leg to the island, which most people remember longer than the resort.",
              },
            ]}
            note="If your inbound lands late, you cannot fly on. We build in a night near the airport and price it before you pay."
          />
        </div>

        <FaqRows items={loc.faqs} />
      </Container>

      {/* Packages here */}
      <Section tone="muted" bordered="both" className="mt-[var(--section-y)]">
        <Container>
          <div className="mb-10 max-w-[620px]">
            <Label className="mb-4">Here</Label>
            <h2 className="m-0 mb-4 text-[clamp(28px,3.2vw,40px)] font-medium leading-[1.14] tracking-[-0.02em]">
              {packagesHereHeading({ count: packages.length, locationName: loc.name })}
            </h2>
            <p className="m-0 text-body-l text-ink-700">
              Transfers, stay and the stated meal plan are in every price.
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} form="grid" />
            ))}
            {/* One card alone in a three-up row reads as a loading failure. A
                sibling-shaped panel fills the row and does useful work. */}
            {packages.length === 1 && (
              <SiblingPanel
                eyebrow={`Also in ${loc.name}`}
                title="Different nights, different room"
                body={`The same island runs other stays and longer trips. Send us your dates and we'll confirm what's open and what it costs that week.`}
                action={{ label: "Ask about dates", href: "/contact" }}
              />
            )}
            {packages.length === 0 && (
              <SiblingPanel
                eyebrow={`${loc.name} soon`}
                title="We haven't opened this one up yet"
                body="It is on the list. Tell us when you can travel and we'll say whether it will be ready, or point you at the nearest thing that suits."
                action={{ label: "Ask us", href: "/contact" }}
              />
            )}
          </div>
        </Container>
      </Section>

      {/* Stay types on this island — overrides applied */}
      {stayTypes.length > 0 && (
        <Section flush className="pt-[var(--section-y)]">
          <Container>
            <div className="mb-10 max-w-[620px]">
              <Label className="mb-4">Where you&rsquo;d sleep</Label>
              <h2 className="m-0 text-[clamp(28px,3.2vw,40px)] font-medium leading-[1.14] tracking-[-0.02em]">
                What {loc.name} offers.
              </h2>
            </div>
            <div className="flex flex-wrap gap-6">
              {stayTypes.map((s) => (
                <StayTypeCard key={s.id} stayType={s} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section>
        <Container>
          <ClosingCta
            heading={`Is ${loc.name} the right call?`}
            lede="Tell us which half of the year you can travel and we'll say whether this is the one, or point you somewhere better."
            primary={{ label: "Ask about dates", href: "/contact" }}
            secondary={{ label: "Other locations", href: "/locations" }}
          />
        </Container>
      </Section>

      <Footer />
    </main>
  );
}
