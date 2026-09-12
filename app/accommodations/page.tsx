// app/accommodations/page.tsx
//
// "Stays" in the nav; /accommodations in the URL.
//
// The five kinds of night come first, before any listing, because that is the
// decision that narrows everything else and it is where the budget is really set.
// A villa on stilts and a room above a family kitchen are both good weeks, and the
// gap between them is an order of magnitude.

import type { Metadata } from "next";
import { getStayCards } from "@/lib/data/accommodations";
import { getStayTypes } from "@/lib/data/stay-types";
import { stayListDensity } from "@/lib/design/density";
import { staysHeading, staysLede } from "@/lib/design/inventory";
import { SITE_IMAGES } from "@/lib/design/site-images";
import { getImageUrl } from "@/lib/image-urls";
import { Container, Label, Section } from "@/components/ui";
import { Footer } from "@/components/layout/footer";
import { PageHead } from "@/components/layout/page-head";
import {
  ClosingCta,
  EditorialSplit,
  StayCard,
  StayTypeCard,
} from "@/components/patterns";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stays",
  description:
    "Where you sleep changes the whole trip. Five kinds of night, and the islands we sell them on.",
};

export default async function AccommodationsPage() {
  const [stays, stayTypes] = await Promise.all([getStayCards(), getStayTypes()]);
  const density = stayListDensity(stays.length);

  return (
    <main>
      <PageHead
        image={getImageUrl("images", SITE_IMAGES.staysHead)}
        imageAlt="A resort island at dusk"
        eyebrow="Stays"
        title="Where you sleep changes the whole trip."
        lede="A villa on stilts and a room above a family kitchen are both good weeks. They are very different weeks, and the gap in price is enormous."
        nav={{ active: "stays", cta: { label: "Book now", href: "/contact", arrow: true } }}
      />

      {/* Zero inventory needed, and it frames the budget decision */}
      <Section flush className="pt-20">
        <Container>
          <div className="mb-10 max-w-[620px]">
            <Label className="mb-4">Start here</Label>
            <h2 className="m-0 mb-4 text-[clamp(28px,3.2vw,40px)] font-medium leading-[1.14] tracking-[-0.02em]">
              Five kinds of night.
            </h2>
            <p className="m-0 text-body-l text-ink-700">
              Decide this before you pick an island. It narrows everything else, and
              it is where the budget is really set.
            </p>
          </div>
          <div className="flex flex-wrap gap-6">
            {stayTypes.map((s) => (
              <StayTypeCard key={s.id} stayType={s} />
            ))}
          </div>
        </Container>
      </Section>

      <Section flush className="pt-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink-200 pb-5">
            <div className="min-w-0 max-w-[620px]">
              <Label className="mb-4">The list</Label>
              <h2 className="m-0 mb-3 text-[clamp(28px,3.2vw,40px)] font-medium leading-[1.14] tracking-[-0.02em]">
                {staysHeading(stays.length)}
              </h2>
              <p className="m-0 text-[17px] leading-[27px] text-ink-700">
                {staysLede(stays.length)}
              </p>
            </div>
          </div>

          <div
            className={
              density.layout === "rows"
                ? "mt-8 flex flex-col gap-6"
                : "mt-8 flex flex-wrap gap-6"
            }
          >
            {stays.map((stay) => (
              <StayCard
                key={stay.id}
                stay={stay}
                form={density.layout === "rows" ? "row" : "grid"}
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* The page's trust argument. Needs no inventory. */}
      <Section tone="muted" bordered="top" className="mt-[var(--section-y)]">
        <Container>
          <EditorialSplit
            image="right"
            src={SITE_IMAGES.staysTrust}
            bucket="images"
            alt="A local island street in the late afternoon"
            eyebrow="How we choose"
            title="We have stayed in every one of these."
            body="Not a site visit, not a press trip — a night, and usually several. It is the only way to know whether the house reef is any good or the generator is under your window."
            rows={[
              { text: "We swim the house reef before we list the island" },
              { text: "We eat the half-board menu, not the tasting menu" },
              { text: "If we would not send our own family, it is not on the list" },
            ]}
          />
        </Container>
      </Section>

      <Section>
        <Container>
          <ClosingCta
            heading="Every stay comes as a package."
            lede="Transfers and meals included, priced per person. Pick the nights and we'll confirm the room."
            primary={{ label: "See all packages", href: "/packages" }}
            secondary={{ label: "Ask us", href: "/contact" }}
          />
        </Container>
      </Section>

      <Footer />
    </main>
  );
}
