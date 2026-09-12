// lib/design/inventory.ts
//
// Copy that changes with the catalogue.
//
// The rule behind all of it (brief §1.2): inventory claims have to agree with each
// other. A launch-day page that says "2 packages" in one band and "14 guesthouses"
// in a location row contradicts itself, and the contradiction is what makes a small
// catalogue look thin. Every number here comes from a Prisma `_count`; none is
// ever hardcoded.
//
// The second rule: nothing draws attention to thinness. Below four packages the
// Home section says what's coming rather than counting what's there.

export function pluralise(n: number, singular: string, plural?: string): string {
  return `${n} ${n === 1 ? singular : plural ?? `${singular}s`}`;
}

/** The line beside Home's "See all packages" pill. */
export function packageCountLine(args: { packages: number; locations: number }): string {
  if (args.packages <= 3) return "More islands added each season";
  return `${args.packages} packages across ${args.locations} islands`;
}

/**
 * The right-hand meta on a location row or tile. Packages lead when there are any,
 * because a package is the thing we actually sell.
 */
export function locationMeta(args: { packages: number; accommodations: number }): string {
  if (args.packages > 0) return pluralise(args.packages, "package");
  if (args.accommodations > 0) return pluralise(args.accommodations, "stay");
  // No prototype covered a location with nothing in it, but Thulusdhoo is exactly
  // that today — so say something forward-looking rather than print "0 packages".
  return "Coming soon";
}

/** Location detail's "Packages here" heading, singularised. */
export function packagesHereHeading(args: { count: number; locationName: string }): string {
  return args.count === 1
    ? `The ${args.locationName} package`
    : `Packages in ${args.locationName}`;
}

export function staysHeading(count: number): string {
  return count <= 2 ? "The islands we sell" : "Every island we sell";
}

export function staysLede(count: number): string {
  return count <= 2
    ? "Each one is in a package with its transfers and meals already priced."
    : `${count} islands and boats, each one in at least one package with transfers and meals priced in.`;
}

/** The Packages toolbar count. */
export function resultCount(n: number, empty: boolean): string {
  if (empty || n === 0) return "No packages";
  return pluralise(n, "package");
}

export function resultHint(args: {
  count: number;
  empty: boolean;
  /** True only when the visitor actually applied a filter. */
  filtered?: boolean;
  sorted?: boolean;
}): string {
  // "with those filters" is a lie when no filter was set, and it is the kind of
  // lie that makes an empty catalogue look like a broken page.
  if (args.empty) return args.filtered ? "with those filters" : "listed at the moment";
  if (args.sorted) return "Sorted by price. Transfers included throughout.";
  return "Every one is a single island, transfers in";
}

/** Location detail's "We run" cell. */
export function inventoryLine(count: number): string {
  return pluralise(count, "package");
}

/** Accommodation detail — rooms are not sold standalone, so we say what it is in. */
export function packagesLine(count: number): string {
  // A stay linked to no package is unsellable, and "In 0 packages" reads like a
  // bug. Kaani Beach Hotel is in exactly this state today.
  if (count === 0) return "Not in a package yet";
  return `In ${pluralise(count, "package")}`;
}

export function accommodationPackagesHeading(count: number): string {
  return count === 1
    ? "This island comes as one package."
    : `This island comes in ${count} packages.`;
}

export function accommodationPackagesCta(count: number): string {
  return count === 1 ? "See the package" : `See all ${count} packages`;
}

/* ============================================================================
   EMPTY STATES
   ============================================================================

   Two different nothings, and telling them apart is the whole point.

   A visitor who filtered to nothing should be told to drop the filter. A visitor
   looking at an empty catalogue should be told what is coming and offered a way
   to ask — telling that person to "clear all filters" is advice about a filter
   they never set, and it makes the site look broken rather than empty.

   None of this copy apologises or mentions the database. It says what is true and
   gives the visitor their next move, which for a travel business is always the
   same move: talk to someone.

   TONE RULE, and it is the easy one to get wrong. An empty list must read as an
   established operator between seasons, never as a new business finding its feet.
   So: future tense, and more is always coming. Never "the first islands", never
   "yet", never a justification for having few ("we would rather sell one properly
   than twenty we have not seen" reads as an apology and invites the doubt it is
   trying to answer). The reason a list is short is commercial and routine —
   prices and dates for the coming season are being confirmed — and that is what
   it should sound like.
*/

/** The listing heading for /locations. Never hardcode the number of islands. */
export function locationsHeading(count: number): string {
  if (count === 0) return "More islands are on the way.";
  if (count === 1) return "One island now, with more to come.";
  return `${spell(count)} islands, and no two of them the same.`;
}

export function locationsLede(count: number): string {
  if (count === 0) {
    return "We are adding to the selection for the coming season. Tell us when you want to travel and what you want out of the week, and we will come back with the islands that fit.";
  }
  if (count === 1) {
    return "More are being added for the coming season. Tell us what you want out of the week and we will tell you whether this one fits, or what else will.";
  }
  return "One is a jungle island inside a biosphere reserve. One has whale sharks all year. One sits beside two of the best waves in the country. What you pick decides what the week is.";
}

/**
 * Small numbers read better as words in a heading, and these headings are large
 * enough that a numeral looks like a statistic. Past twelve the numeral is fine.
 */
function spell(n: number): string {
  const words = [
    "Zero", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
  ];
  return words[n] ?? String(n);
}

export interface EmptyCopy {
  eyebrow: string;
  title: string;
  body: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}

/** /packages with nothing to show. `filtered` is what makes the copy honest. */
export function packagesEmptyCopy(filtered: boolean): EmptyCopy {
  if (filtered) {
    return {
      eyebrow: "No matches",
      title: "Nothing matches that filter.",
      body: "Drop the filter to see everything we run — or tell us what you had in mind and we will say whether we can do it.",
      primary: { label: "See all packages", href: "/packages" },
      secondary: { label: "Ask about dates", href: "/contact" },
    };
  }
  return {
    eyebrow: "More coming",
    title: "New packages are on the way.",
    body: "We are confirming prices and dates for the coming season. Tell us when you want to travel and we will put a trip together and send it over.",
    primary: { label: "Tell us what you want", href: "/contact" },
    secondary: { label: "Read the guide", href: "/guide" },
  };
}

/** /locations with nothing to show. */
export function locationsEmptyCopy(): EmptyCopy {
  return {
    eyebrow: "More coming",
    title: "More islands are on the way.",
    body: "We are adding to the selection for the coming season. Tell us the sort of week you want — quiet and close, or further out on the reef — and we will come back with options.",
    primary: { label: "Tell us what you want", href: "/contact" },
    secondary: { label: "Read the guide", href: "/guide" },
  };
}

/** /accommodations with nothing to show. The five stay types still stand. */
export function staysEmptyCopy(): EmptyCopy {
  return {
    eyebrow: "More coming",
    title: "More stays are being added.",
    body: "The five kinds of night above are still the decision that matters most, and the one to make first. Tell us which sounds like your week and we will name the places worth booking.",
    primary: { label: "Ask us", href: "/contact" },
    secondary: { label: "See the packages", href: "/packages" },
  };
}

/** Home's featured band, when there is nothing featured to show. */
export function homePackagesEmptyCopy(): EmptyCopy {
  return {
    eyebrow: "More coming",
    title: "New trips are on the way.",
    body: "We are confirming prices and dates for the coming season. Tell us roughly when you want to travel and we will send back what fits.",
    primary: { label: "Tell us what you want", href: "/contact" },
  };
}
