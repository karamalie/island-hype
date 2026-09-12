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
  if (args.packages <= 3) return "More islands added as we open them up";
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

export function resultHint(args: { count: number; empty: boolean; sorted?: boolean }): string {
  if (args.empty) return "with those filters";
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
