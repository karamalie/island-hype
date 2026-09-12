// app/contact/page.tsx
//
// No photo band — this page is a form, and a hero would push the thing people
// came for below the fold.
//
// WhatsApp is the primary contact because it is how most people actually reach
// us, and it is the one place in the system where teal fills a button.

import type { Metadata } from "next";
import { getPackageCards } from "@/lib/data/packages";
import { getContactDetails, whatsappHref } from "@/lib/data/settings";
import { SITE_IMAGES } from "@/lib/design/site-images";
import { Container, Label, Section } from "@/components/ui";
import { Footer } from "@/components/layout/footer";
import { NavBar } from "@/components/layout/nav-bar";
import { NumberedSteps, PhotoFrame } from "@/components/patterns";
import { EnquiryForm } from "@/components/contact/enquiry-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell us which package and when. We check the room and the transfer seats with the island directly, then come back with the real total.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const { package: preselect } = await searchParams;
  const [packages, contact] = await Promise.all([
    // Ended packages are not offered here — you cannot enquire about a trip that
    // has finished.
    getPackageCards({ includeEnded: false }),
    getContactDetails(),
  ]);

  const initial = packages.find((p) => p.slug === preselect)?.id;

  return (
    <main>
      <NavBar surface="solid" active="home" cta={{ label: "Book now", href: "/packages" }} />

      <Container className="pt-14">
        <div className="max-w-[640px]">
          <Label className="mb-5">Contact</Label>
          <h1 className="m-0 mb-5 text-display-l">Tell us which package and when.</h1>
          <p className="m-0 text-[clamp(17px,1.6vw,20px)] leading-[1.55] text-ink-700">
            We check the room and the transfer seats with the island directly, then
            come back with the real total. Usually the same day.
          </p>
        </div>
      </Container>

      <Container className="pt-12">
        <div className="flex flex-wrap items-start gap-14">
          <div className="min-w-0 shrink grow basis-[440px]">
            <EnquiryForm
              packages={packages.map((p) => ({
                id: p.id,
                slug: p.slug,
                name: p.name,
                eyebrow: p.locationName,
              }))}
              initialPackageId={initial}
            />
          </div>

          <div className="min-w-0 shrink basis-[320px]">
            <div className="mb-4 rounded-lg border border-ink-200 bg-ink-50 p-6">
              <div className="mb-4 font-mono text-label-sm uppercase text-meta">
                Faster, if you prefer
              </div>
              <div className="flex flex-col gap-2">
                {/* The one place teal fills a button. */}
                <a
                  href={whatsappHref(contact.whatsapp, "Hello — I'm looking at your packages.")}
                  className="flex h-12 items-center justify-center rounded-full bg-teal-deep px-5 text-body-s font-medium text-white hover:bg-teal-press"
                >
                  WhatsApp us
                </a>
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="flex h-12 items-center justify-center rounded-full border border-ink-200 bg-white px-5 text-body-s font-medium text-ink-900 hover:bg-ink-50"
                >
                  {contact.phone}
                </a>
              </div>
              <p className="m-0 mt-4 text-caption leading-5 text-meta">
                WhatsApp is how most people reach us. Photos of what you want are
                welcome.
              </p>
            </div>

            <div className="mb-4 rounded-lg border border-ink-200 bg-white p-6">
              <div className="mb-4 font-mono text-label-sm uppercase text-meta">
                When we reply
              </div>
              {contact.hours.map((h, i) => (
                <div
                  key={h.day}
                  className={`flex items-baseline justify-between gap-4 border-t border-ink-200 py-3 ${
                    i === contact.hours.length - 1 ? "border-b" : ""
                  }`}
                >
                  <span className="text-body-xs text-ink-700">{h.day}</span>
                  <span
                    className={
                      h.closed ? "text-body-xs text-meta" : "text-body-xs font-medium"
                    }
                  >
                    {h.value}
                  </span>
                </div>
              ))}
              <p className="m-0 mt-4 text-caption leading-5 text-meta">
                {contact.timezoneNote}
              </p>
            </div>

            <div className="rounded-lg border border-ink-200 bg-white p-6">
              <div className="mb-4 font-mono text-label-sm uppercase text-meta">
                Where we are
              </div>
              <p className="m-0 mb-4 text-body-s">{contact.place}</p>
              <PhotoFrame
                src={SITE_IMAGES.contactMap}
                bucket="images"
                alt="Male', the Maldivian capital"
                ratio="4 / 3"
                radius="lg"
                sizes="320px"
              />
            </div>
          </div>
        </div>
      </Container>

      <Section tone="muted" bordered="top" className="mt-[var(--section-y)]">
        <Container>
          <div className="mb-10 max-w-[620px]">
            <Label className="mb-4">After you send it</Label>
            <h2 className="m-0 mb-4 text-[clamp(28px,3.2vw,40px)] font-medium leading-[1.14] tracking-[-0.02em]">
              What happens next.
            </h2>
            <p className="m-0 text-body-l text-ink-700">
              No automated sequence, no chasing. One person picks it up and stays
              with it.
            </p>
          </div>
          <NumberedSteps
            steps={[
              {
                title: "We check with the island",
                body: "The room and the transfer seats, for your exact dates. This is a phone call, not a live inventory lookup.",
              },
              {
                title: "You get the real total",
                body: "Per person and in full, with taxes and transfers in. If your flight times make the transfer awkward, we say so here.",
              },
              {
                title: "You pay, we confirm",
                body: "Then we book the transfers against your flight numbers and send everything through in one document.",
              },
            ]}
          />
        </Container>
      </Section>

      <Footer />
    </main>
  );
}
