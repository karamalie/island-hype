// app/guide/page.tsx
//
// The first-timer's guide. Ten sections, up from the six the old page had, with
// geography and people deliberately first: they are the "what is this country"
// grounding that every practical section below assumes.
//
// No photo band — this is editorial, and a hero would push the contents rail and
// the first paragraph below the fold.
//
// This is the one page on the client's real photography rather than placeholders.
// The images are served from our own media route; they used to hot-link the live
// site, which is fine for review and wrong for shipping.
//
// §10 Things to do sits OUTSIDE the two-column article, at full container width,
// so the six activity cards get three-up on a desktop. It is still in the
// contents rail and still anchored #do.

import type { Metadata } from "next";
import Link from "next/link";
import { Container, Label, Section } from "@/components/ui";
import { Footer } from "@/components/layout/footer";
import { NavBar } from "@/components/layout/nav-bar";
import { ClosingCta, PhotoFrame } from "@/components/patterns";
import { ContentsRail } from "@/components/guide/contents-rail";
import { SITE_IMAGES } from "@/lib/design/site-images";
import {
  Callout,
  CompareCards,
  DataTable,
  H2,
  H3,
  MarkList,
  P,
  PullQuote,
  StatRow,
  ValueRows,
} from "@/components/guide/prose";

export const metadata: Metadata = {
  title: "The Maldives, for people who haven't been",
  description:
    "What the Maldives actually is — the geography, the people, the faith — and everything we get asked before people book: when to come, what a transfer really costs, and resort versus local island.",
};

const CONTENTS = [
  { id: "geography", label: "Geography" },
  { id: "culture", label: "People and culture" },
  { id: "when", label: "When to come" },
  { id: "island", label: "Resort or local island" },
  { id: "transfers", label: "Transfers, explained" },
  { id: "cost", label: "What things cost" },
  { id: "water", label: "In the water" },
  { id: "etiquette", label: "Rules and etiquette" },
  { id: "pack", label: "What to pack" },
  { id: "do", label: "Things to do" },
];

const ACTIVITIES = [
  {
    src: "guide/snorkeling-reef.jpg",
    title: "Diving and snorkelling",
    body: "Twenty to fifty metres of visibility over reefs that are in genuinely good condition. Manta rays, whale sharks, grey reef sharks and turtles, most of it reachable from a house reef rather than a boat.",
    season: "Best December – April for visibility",
    alt: "Snorkeller over a shallow coral reef",
  },
  {
    src: "guide/manta-ray.jpg",
    title: "Marine encounters",
    body: "Hanifaru Bay in Baa gathers manta rays in numbers that are hard to credit — a hundred or more feeding at once. Snorkel only, strictly permitted, and worth planning a whole trip around.",
    season: "Best May – November, Baa Atoll",
    alt: "A manta ray gliding over the reef",
  },
  {
    src: "guide/surfing-waves.jpg",
    title: "Surfing",
    body: "Reef breaks at Thulusdhoo and Himmafushi, within reach of Male' on a speedboat. The biggest swells arrive June to September, which is also when the resorts are cheapest.",
    season: "Season February – November",
    alt: "A surfer riding a wave off a Maldivian island",
  },
  {
    src: "guide/local-island-life.jpg",
    title: "Island hopping",
    body: "Inhabited islands with schools, tea shops, fishing harbours and a football pitch. The cheapest and most interesting day you can have here — and the one most visitors skip entirely.",
    season: "Modest dress required",
    alt: "A street on an inhabited Maldivian island",
  },
  {
    src: "guide/sea-of-stars.jpg",
    title: "Sea of stars",
    body: "Bioluminescent plankton lighting the shallows blue as they are disturbed. Unpredictable and impossible to book — Vaadhoo in Raa is the island it is named for.",
    season: "Best June – December",
    alt: "Bioluminescent plankton glowing in the shallows",
  },
  {
    src: "guide/dhoni-sunset.jpg",
    title: "Sunset dhoni cruise",
    body: "A couple of hours on a traditional dhoni as the light goes, usually with spinner dolphins alongside. Almost every island runs one and it is almost always worth doing.",
    season: "Year round",
    alt: "A traditional dhoni at sunset",
  },
];

export default function GuidePage() {
  return (
    <main>
      <NavBar surface="solid" active="guide" cta={{ label: "Book now", href: "/packages" }} />

      {/* Article head — on white, because this is editorial */}
      <Container className="pt-14">
        <div className="max-w-[760px]">
          <Label className="mb-5">First-timer&rsquo;s guide</Label>
          <h1 className="m-0 mb-5 text-display-l">
            The Maldives, for people who haven&rsquo;t been.
          </h1>
          <p className="m-0 text-[clamp(17px,1.6vw,20px)] leading-[1.55] text-ink-700">
            What the Maldives actually is — the geography, the people, the faith —
            and then everything we get asked before people book: when to come, what
            a transfer really costs, and the difference between a resort island and
            a local one. Written by people who live here.
          </p>
        </div>
      </Container>

      <Container className="pt-10">
        <PhotoFrame
          src={SITE_IMAGES.guideHero}
          bucket="images"
          alt="A seaplane on the water beside a jetty"
          ratio="21 / 9"
          radius="xl"
          className="min-h-[280px]"
          sizes="100vw"
          priority
        />
      </Container>

      {/* Two-column article */}
      <Container className="pt-14">
        <div className="flex flex-wrap items-start gap-14">
          <div className="min-w-0 shrink basis-[220px]">
            <ContentsRail items={CONTENTS} />
          </div>

          <article className="min-w-0 shrink grow basis-[520px]">
            {/* 01 — Geography */}
            <H2 id="geography" num="01">
              Geography
            </H2>
            <P>
              Almost everything that is strange and good about the Maldives follows
              from its geography. This is a country that is 99% sea, built entirely
              on coral, with no hill anywhere in it.
            </P>

            <H3>Understanding atolls</H3>
            <P>
              The Maldives is made up of 26 natural atolls containing roughly 1,192
              coral islands. An atoll is a ring-shaped coral reef enclosing a
              lagoon, and each one began as a volcano.
            </P>
            <P>
              As those ancient volcanoes subsided beneath the Indian Ocean, coral
              grew upward on their rims, keeping pace with the sinking rock. The
              mountain eventually disappeared entirely and the reef remained — a ring
              of living coral around a shallow turquoise lagoon where a peak used to
              be.
            </P>
            <StatRow
              stats={[
                { label: "Atolls", value: "26" },
                { label: "Islands", value: "1,192" },
                { label: "Inhabited", value: "~200" },
                { label: "Land area", value: "298 km²" },
              ]}
            />
            <div className="mb-6 flex max-w-[34em] flex-wrap gap-3">
              <PhotoFrame
                src="guide/maldives-map.jpg"
                bucket="images"
                alt="A map of the Maldives archipelago"
                ratio="4 / 3"
                radius="lg"
                className="min-w-0 shrink grow basis-[200px]"
                sizes="(max-width: 768px) 100vw, 260px"
              />
              <PhotoFrame
                src="guide/atoll-formation.jpg"
                bucket="images"
                alt="An atoll rim, showing the reef ring around a lagoon"
                ratio="4 / 3"
                radius="lg"
                className="min-w-0 shrink grow basis-[200px]"
                sizes="(max-width: 768px) 100vw, 260px"
              />
            </div>
            <P>
              The chain runs north to south in two parallel rows of atolls, which is
              why a domestic flight can take longer than the international one that
              got you here.
            </P>

            <H3>Where it actually is</H3>
            <P>
              The Maldives sits in open ocean 750 km south-west of India and 400 km
              south-west of Sri Lanka, straddling the equator. The archipelago
              stretches about 823 km from its northernmost atoll to its southernmost
              — further than the length of Great Britain — across territory that is
              almost entirely water.
            </P>
            <P>
              It all sits on the Chagos-Laccadive Ridge, an extinct volcanic mountain
              range running down the floor of the Indian Ocean. The atolls are its
              summits.
            </P>

            <H3>The lowest country on earth</H3>
            <P>
              Average elevation is about 1.5 metres above sea level and the highest
              natural point in the entire country is roughly 2.4 metres. Nowhere else
              is flatter.
            </P>
            <P>
              In practice this is why the islands feel the way they do: you are never
              more than a couple of hundred metres from water, the horizon is always
              visible, and the lagoon shelves so gently that you can walk out a long
              way before it reaches your waist. It is also why coral health and sea
              level are not abstract topics here — the reef is the land&rsquo;s
              foundation and its sea defence at the same time.
            </P>
            <PhotoFrame
              src="guide/island-beach-aerial.jpg"
              bucket="images"
              alt="A small island and its shelving lagoon from above"
              ratio="16 / 9"
              radius="lg"
              className="mb-10 max-w-[34em]"
              sizes="(max-width: 768px) 100vw, 560px"
            />

            {/* 02 — People and culture */}
            <H2 id="culture" num="02">
              People and culture
            </H2>
            <P>
              Tourism is arranged so that you can visit the Maldives without meeting
              it. That is a shame, and easily fixed — a day on an inhabited island is
              the cheapest and most interesting thing you can do here.
            </P>
            <figure className="m-0 mb-6 max-w-[34em]">
              <PhotoFrame
                src="guide/male-mosque.jpg"
                bucket="images"
                alt="The Grand Friday Mosque in Male'"
                ratio="16 / 9"
                radius="lg"
                sizes="(max-width: 768px) 100vw, 560px"
              />
              <figcaption className="mt-3 text-caption leading-5 text-meta">
                The Grand Friday Mosque in Male&rsquo;, part of the Islamic Centre
                opened in 1984. It is the largest mosque in the country, with room for
                around 5,000 worshippers, and its gold dome is the first landmark you
                see coming into the capital.
              </figcaption>
            </figure>

            <H3>The Maldivian people</H3>
            <P>
              Around 515,000 people live here, principally of Indo-Aryan descent with
              Arab, African and South-East Asian ancestry layered in by a thousand
              years of trade across the Indian Ocean. Family sits at the centre of
              things, and hospitality is offered quickly and without ceremony.
            </P>
            <P>
              The language is Dhivehi, written in Thaana — a script that runs right to
              left and is used nowhere else on earth. English is widely spoken,
              near-universally in tourism and among younger Maldivians, so you will
              not struggle. A few words still go a long way.
            </P>
            <ValueRows
              rows={[
                { label: "Hello", value: "Assalaamu alaikum" },
                { label: "Thank you", value: "Shukuriyaa" },
                { label: "Yes / no", value: "Aan / noon" },
                { label: "Delicious", value: "Molhu" },
              ]}
            />

            <H3>Islam</H3>
            <P>
              The Maldives is a Sunni Muslim country, and has been since its
              conversion in 1153 AD. Islam is the state religion and citizenship is
              tied to it. Daily life on inhabited islands runs to the rhythm of the
              five prayers — shops and cafes close for ten or fifteen minutes after
              each call, then reopen as if nothing happened.
            </P>
            <P>
              On a resort island you will notice none of this. On a local island it
              shapes the day, and a little awareness of it is the difference between
              being a guest and being an inconvenience — see{" "}
              <a href="#etiquette" className="text-teal-deep hover:text-ink-900">
                rules and etiquette
              </a>{" "}
              below.
            </P>

            <H3>Music, food and craft</H3>
            <P>
              Maldivian culture is a sea culture: the food comes out of the water, the
              music was made on boats and beaches, and the crafts use what washes up
              or grows on the island.
            </P>
            <MarkList
              items={[
                "Bodu beru. Literally “big drum” — fifteen to twenty men, drums of coconut wood and goatskin, starting slow and ending somewhere frantic.",
                "Mas huni. Shredded smoked tuna, grated coconut, onion and chilli, eaten with flatbread for breakfast. The national dish, and the best thing on any menu here.",
                "Lacquerwork and weaving. Turned wooden boxes finished in layered red and black lacquer, and reed mats woven in geometric patterns. Both are island crafts with named makers.",
              ]}
            />
            <figure className="m-0 mb-6 max-w-[34em]">
              <PhotoFrame
                src="guide/bodu-beru-performance.jpg"
                bucket="images"
                alt="A bodu beru drumming performance"
                ratio="16 / 9"
                radius="lg"
                sizes="(max-width: 768px) 100vw, 560px"
              />
              <figcaption className="mt-3 text-caption leading-5 text-meta">
                A bodu beru performance builds from a steady opening rhythm to a fast,
                high-energy crescendo. Most resorts run one weekly; on a local island
                you may simply come across one.
              </figcaption>
            </figure>
            <P className="mb-10">
              Tea shops are the other thing to do. Every inhabited island has one,
              they are cheap, the short eats are excellent, and nobody will mind you
              sitting there for an hour.
            </P>

            {/* 03 — When to come */}
            <H2 id="when" num="03">
              When to come
            </H2>
            <P>
              There are two seasons and the difference is not subtle. The dry
              north-east monsoon runs roughly December to April: flat water, reliable
              sun, visibility past thirty metres, and the highest prices of the year.
              The wet south-west monsoon runs May to November: shorter heavy
              downpours rather than all-day rain, choppier crossings, and prices that
              can drop by a third.
            </P>
            <P>
              The catch is that the wet season is when the big animals turn up.
              Plankton blooms bring manta rays into Hanifaru Bay in Baa Atoll between
              June and November, and whale sharks are more reliable in the south of
              Ari in the same window.
            </P>
            <Callout label="Our answer">
              If this is your first trip and you want the postcard, come in February.
              If you have been before, or you dive, come in September and spend the
              difference on a better villa.
            </Callout>
            <DataTable
              headers={["Months", "Weather", "Prices"]}
              rows={[
                ["Dec – Apr", "Dry, flat, clear", "Highest"],
                ["May – Jul", "Wettest, windy", "Lowest"],
                ["Aug – Nov", "Mixed, mantas", "Middle"],
              ]}
            />

            {/* 04 — Resort or local island */}
            <H2 id="island" num="04">
              Resort or local island
            </H2>
            <P>
              This is the decision that sets your budget, and most people make it
              without knowing there is a choice. A resort island is one island, one
              hotel, and nobody else on it. A local island is an inhabited Maldivian
              island where guesthouses operate alongside ordinary life — a school, a
              mosque, a football pitch, boats going out at four in the morning.
            </P>
            <PullQuote>
              The reef does not care which you choose. A good guesthouse puts you on
              water every bit as good as a resort three times the price — you just
              walk to the boat instead of being carried to it, and there is no bar.
            </PullQuote>
            <CompareCards
              cards={[
                {
                  title: "Resort island",
                  items: [
                    { text: "Alcohol served" },
                    { text: "Bikinis anywhere" },
                    { text: "$250–900 a night" },
                    { text: "Everything on site, at resort prices" },
                  ],
                },
                {
                  title: "Local island",
                  items: [
                    { text: "Dry island — no alcohol", negative: true },
                    { text: "Swimwear on bikini beach only", negative: true },
                    { text: "$65–150 a night" },
                    { text: "Cafés, shops, actual Maldivian food" },
                  ],
                },
              ]}
            />
            <P>
              Plenty of people do both in one trip: three nights on a local island,
              three on a resort. It costs less than a week of resort and you see
              considerably more of the country.
            </P>

            {/* 05 — Transfers */}
            <H2 id="transfers" num="05">
              Transfers, properly explained
            </H2>
            <P>
              There is one international airport, Velana, on an island next to
              Male&rsquo;. Everything else in the country is reached by boat or small
              plane, and that leg is a real cost that a lot of booking sites leave
              until checkout.
            </P>
            <P>
              Seaplanes are the expensive, memorable option — a twin-engine Twin
              Otter, no assigned seats, pilots often barefoot, flying at about five
              hundred metres. They only fly in daylight. If your inbound lands after
              roughly four in the afternoon, you will not reach the island that day,
              and you need a night near the airport.
            </P>
            <Callout label="The one thing to check">
              The single most common way a Maldives trip goes wrong is an evening
              arrival booked against a seaplane transfer. Check the flight time before
              you book the island.
            </Callout>
            <DataTable
              headers={["Type", "Typical cost", "Notes"]}
              rows={[
                ["Seaplane", "$350–600 return, pp", "Daylight only. 20 kg limit."],
                ["Speedboat", "$100–250 return, pp", "Runs at night. Rough in the wet season."],
                ["Domestic flight", "$200–400 return, pp", "Then a short boat at the far end."],
              ]}
            />
            <figure className="m-0 mb-10 max-w-[34em]">
              <PhotoFrame
                src="guide/seaplane-water.jpg"
                bucket="images"
                alt="A seaplane on the water beside a jetty"
                ratio="16 / 9"
                radius="lg"
                sizes="(max-width: 768px) 100vw, 560px"
              />
              <figcaption className="mt-3 text-caption leading-5 text-meta">
                Twin Otters on floats, no assigned seats, and pilots who are
                frequently barefoot. Most people rate the flight above the resort.
              </figcaption>
            </figure>

            {/* 06 — What things cost */}
            <H2 id="cost" num="06">
              What things cost
            </H2>
            <P>
              Resort extras are where budgets go wrong. A half-board rate does not
              include drinks, and soft drinks are charged like wine. Rough figures,
              per person, at a mid-range resort:
            </P>
            <ValueRows
              rows={[
                { label: "Green tax, per night", value: "$6" },
                { label: "Beer, resort bar", value: "$10–14" },
                { label: "Single dive, with kit", value: "$70–110" },
                { label: "Sandbank or snorkel trip", value: "$40–90" },
                { label: "Meal at a local island café", value: "$5–12" },
              ]}
            />
            <P>
              Most resorts add a 10% service charge and 16% GST on top of quoted
              prices. Our package totals already include both.
            </P>

            {/* 07 — In the water */}
            <H2 id="water" num="07">
              In the water
            </H2>
            <P>
              You do not need to dive. A mask and a pair of fins over a good house
              reef will show you most of what people come here for — reef sharks,
              turtles, rays, and several hundred species of fish that do not much mind
              you being there.
            </P>
            <P>
              If you do dive, the channels are the draw: fast water, big schools, and
              grey reef sharks holding in the current. Vaavu and the southern atolls
              are where the serious diving is. Hanifaru in Baa is snorkel-only by law
              and worth planning a trip around.
            </P>
            <P>
              Bring your own mask if you are particular about fit. Loan gear is usually
              adequate and occasionally awful, and a leaking mask ruins a morning.
            </P>

            {/* 08 — Rules and etiquette */}
            <H2 id="etiquette" num="08">
              Rules and etiquette
            </H2>
            <P>
              The Maldives is a Muslim country and the rules on inhabited islands are
              real, not advisory. None of it is onerous — it is mostly a matter of
              knowing before you arrive.
            </P>
            <H3>Alcohol</H3>
            <P>
              Legal only on resort islands and licensed liveaboards. It cannot be
              brought into the country — bags are scanned on arrival and bottles are
              confiscated.
            </P>
            <H3>Swimwear</H3>
            <P>
              Anything goes on a resort island. On a local island, swimwear is for the
              designated bikini beach; shoulders and knees covered elsewhere.
            </P>
            <H3>Ramadan</H3>
            <P>
              Resorts run normally. On local islands, cafés close during daylight hours
              and it is poor form to eat or drink in the street. Worth avoiding if a
              local island is your plan.
            </P>

            {/* 09 — What to pack */}
            <H2 id="pack" num="09">
              What to pack
            </H2>
            <P>
              Less than you think, with four exceptions. Note the seaplane baggage
              limit — 20 kg checked and 5 kg hand, and it is enforced.
            </P>
            <CompareCards
              cards={[
                {
                  title: "Bring",
                  items: [
                    { text: "Reef-safe sunscreen, factor 50" },
                    { text: "Your own mask and snorkel" },
                    { text: "Rash vest — the sun is directly overhead" },
                    { text: "Modest layer for local islands and Male'" },
                  ],
                },
                {
                  title: "Leave behind",
                  items: [
                    { text: "Alcohol, e-cigarettes, vapes", negative: true },
                    { text: "Shoes beyond one pair of sandals", negative: true },
                    { text: "Hairdryer — every room has one", negative: true },
                    { text: "Cash beyond a little for tips", negative: true },
                  ],
                },
              ]}
            />
          </article>
        </div>
      </Container>

      {/* 10 — Things to do, outside the article so the cards go three-up */}
      <Section flush className="pt-[var(--section-y)]">
        <Container>
          <div id="do" className="mb-10 max-w-[620px] scroll-mt-24">
            <div className="mb-3 font-mono text-label text-teal-deep">10</div>
            <h2 className="m-0 mb-4 text-[clamp(28px,3.2vw,40px)] font-medium leading-[1.14] tracking-[-0.02em]">
              Things to do
            </h2>
            <p className="m-0 text-body-l text-ink-700">
              Six that are worth the effort, and roughly when each one is at its best.
              Most are bookable through the island once you arrive; the seasonal ones
              are worth building the trip around.
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            {ACTIVITIES.map((a) => (
              <div
                key={a.title}
                className="flex min-w-0 shrink grow basis-[300px] max-w-[380px] flex-col overflow-hidden rounded-lg border border-ink-200 bg-white"
              >
                <PhotoFrame
                  src={a.src}
                  bucket="images"
                  alt={a.alt}
                  ratio="16 / 9"
                  sizes="(max-width: 768px) 100vw, 380px"
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2.5 min-h-[52px] text-heading-s">{a.title}</div>
                  <p className="m-0 mb-5 text-body-s text-ink-700">{a.body}</p>
                  <div className="mt-auto font-mono text-label-sm uppercase text-teal-deep">
                    {a.season}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <ClosingCta
            eyebrow="Still got questions"
            heading="Ask a person who lives here."
            lede="We are in Male' and we answer the same day. No obligation, and no sales sequence afterwards."
            primary={{ label: "Ask us anything", href: "/contact" }}
            secondary={{ label: "See our packages", href: "/packages" }}
          />
        </Container>
      </Section>

      <Footer />
    </main>
  );
}
