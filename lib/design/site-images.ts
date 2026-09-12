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
   * The desktop Home hero — the frame the site used before the redesign, and the
   * client's own choice.
   *
   * It is the second brightest image in the library (153 mean, 168 in the lower
   * band). That is fine on a desktop, where the copy sits in the lower third
   * under the scrim's 0.74 stop, and not fine on a phone — hence the separate
   * mobile hero below rather than a scrim hack.
   */
  homeHero: "hero/maldives-aerial.jpg",
  /**
   * The phone hero. Measured, not chosen by eye: in the band where the copy sits,
   * maldives-aerial reads 168/255 and this one reads 81 — and on a phone the copy
   * block fills most of the frame, so that band is unavoidable. Same subject, an
   * island and its reef from the air, so the page still says the same thing.
   */
  homeHeroMobile: "guide/island-aerial-heart.jpg",
  /** 4:5 portrait, "why here". */
  homeWhyHere: "guide/atoll-formation.jpg",
  /** 4:5 portrait, "what's included" — a seaplane, since transfers are the point. */
  homeIncluded: "guide/seaplane-water.jpg",
  /** 1:1, the locations frame when tiles are not warranted. */
  homeAtolls: "guide/island-aerial-heart.jpg",
  /** 21:9 page heads. */
  packagesHead: "guide/overwater-jetty-aerial.jpg",
  locationsHead: "guide/island-beach-aerial.jpg",
  staysHead: "guide/island-resort-wide.jpg",
  /** The atoll map, on the locations page and in "getting there". */
  map: "guide/maldives-map.jpg",
  /** 4:5 portrait, "we have stayed in every one of these". */
  staysTrust: "guide/local-island-life.jpg",
  /** Contact's Male' frame. */
  contactMap: "guide/male-mosque.jpg",
} as const;
