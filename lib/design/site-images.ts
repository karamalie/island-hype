// lib/design/site-images.ts
//
// The editorial photographs — the ones that belong to a page rather than to a
// package or an island. They live in the `images` bucket alongside the guide's
// library, which is where the client's real photography already is.
//
// Task 25 of the revamp plan moves these into SiteSetting so staff can swap them
// without a deploy. Until then they are named here rather than inline in nine
// page files, so there is one place to change.

export const SITE_IMAGES = {
  /**
   * The Home hero on iPad and up — the frame the site used before the redesign,
   * and the client's choice. The swap below happens at 768px, so iPad portrait
   * keeps this one.
   */
  homeHero: "hero/maldives-aerial.jpg",
  /**
   * The phone hero. Art direction rather than a crop, because the problem is not
   * framing: this image is the second brightest in the library (168/255 in the
   * band where the copy sits), and on a phone the copy block fills most of the
   * frame instead of the lower third, so it lands squarely in that band. The
   * jetty aerial reads 96 there and is mostly uniform deep teal, which is what
   * white type actually needs.
   */
  homeHeroMobile: "guide/overwater-jetty-aerial.jpg",
  /**
   * 4:5 portrait, "why here". No text over it, so brightness does not matter —
   * only that it reads as an atoll rim.
   */
  homeWhyHere: "guide/island-aerial-heart.jpg",
  /** 4:5 portrait, "what's included" — a dhoni, since transfers are the point. */
  homeIncluded: "guide/dhoni-sunset.jpg",
  /** 1:1, the locations frame in the rows fallback. No text over it. */
  homeAtolls: "guide/island-beach-aerial.jpg",

  /**
   * The full-bleed page heads. These are the constrained slots: a 380px band
   * spanning a 1440px viewport wants roughly 2000px of source before it starts
   * looking soft on a retina screen, and the library has only five files that
   * clear that. Every assignment below is the best available fit for a band that
   * has to carry a white h1 and lede:
   *
   *   overwater-villas-aerial  2560px, band 120
   *   hero-aerial              3992px, band 107
   *   atoll-formation          1920px, band  96  (the one compromise on width)
   *
   * Not usable here, for the record, so nobody reaches for them: island-resort-wide
   * is 800px, local-island-life 670px and male-mosque 800px — all far too small
   * full-bleed. island-beach-aerial is large enough but reads 179/255 in the copy
   * band, so white text fails on it.
   */
  packagesHead: "guide/overwater-villas-aerial.jpg",
  locationsHead: "guide/hero-aerial.jpg",
  staysHead: "guide/atoll-formation.jpg",

  /** The guide's own opener, and the largest file in the library at 5800px. */
  guideHero: "guide/seaplane-water.jpg",

  /** The atoll map, on the locations page and in "getting there". */
  map: "guide/maldives-map.jpg",
  /** 4:5 portrait, "we have stayed in every one of these". */
  staysTrust: "guide/local-island-life.jpg",
  /** Contact's Male' frame. */
  contactMap: "guide/male-mosque.jpg",
} as const;
