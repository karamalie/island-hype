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
  /** 4:5 portrait, "why here". */
  homeWhyHere: "guide/atoll-formation.jpg",
  /** 4:5 portrait, "what's included" — a seaplane, since transfers are the point. */
  homeIncluded: "guide/seaplane-water.jpg",
  /** 1:1, the locations frame when tiles are not warranted. */
  homeAtolls: "guide/island-beach-aerial.jpg",
  /**
   * 21:9 page heads. Each is used once, and each is dark enough through the
   * middle to carry the white h1 and lede that sit on it.
   */
  packagesHead: "guide/island-resort-wide.jpg",
  locationsHead: "guide/island-aerial-heart.jpg",
  staysHead: "guide/overwater-villas-aerial.jpg",
  /** The atoll map, on the locations page and in "getting there". */
  map: "guide/maldives-map.jpg",
  /** 4:5 portrait, "we have stayed in every one of these". */
  staysTrust: "guide/local-island-life.jpg",
  /** Contact's Male' frame. */
  contactMap: "guide/male-mosque.jpg",
} as const;
