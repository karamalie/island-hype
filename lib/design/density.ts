// lib/design/density.ts
//
// The design brief's least obvious requirement: the same components have to look
// deliberate whether the database holds two packages or ninety. The business
// launches with as few as two packages, two islands and roughly eight photographs.
//
// The prototypes exposed this as a `density` enum prop so reviewers could flip
// between states. That prop is a review affordance and does not ship — every
// decision below is derived from a real query count instead.
//
// The thresholds are from the brief §1.1 and are deliberate, not round numbers:
// two cards in a three-column grid look broken, filtering two results is theatre,
// and a 1-of-1 carousel with arrows is a bug rather than a feature.

export interface ListDensity {
  layout: "rows" | "grid";
  quickPills: boolean;
  filterBar: boolean;
}

/**
 * Wide rows fill the width and carry more per package, which is exactly what you
 * want when there are few. Grids only start earning their keep past four.
 */
export function packageListDensity(n: number): ListDensity {
  return {
    layout: n <= 4 ? "rows" : "grid",
    quickPills: n >= 3 && n < 6,
    filterBar: n >= 6,
  };
}

/** Accommodations use the same thresholds as packages. */
export function stayListDensity(n: number): ListDensity {
  return packageListDensity(n);
}

/**
 * Tiles need both enough subjects and enough photography. Two photo tiles read as
 * a gap; two list rows read as an editorial choice.
 *
 * `tilesMin` differs by page on purpose: Home's location tiles are a 180px-basis
 * secondary strip and switch at 4, while the Locations page's are 260px cards and
 * switch at 5.
 */
export function locationsLayout(args: {
  count: number;
  photoRich: boolean;
  tilesMin: 4 | 5;
}): "tiles" | "rows" {
  return args.photoRich && args.count >= args.tilesMin ? "tiles" : "rows";
}

/**
 * Per-item, and that matters. A single photo-less package must not strip the
 * image well from every sibling in the row, which is what a page-level flag
 * would do.
 */
export function isPhotoRich(item: {
  coverImage: string | null;
  images?: { url: string }[];
}): boolean {
  return Boolean(item.coverImage) || (item.images?.length ?? 0) > 0;
}

/**
 * Aggregate, for layout switches only. Demands every item carry a cover, because
 * a tile grid with one grey hole in it looks like a failure rather than a choice.
 */
export function isAggregatePhotoRich(items: { coverImage: string | null }[]): boolean {
  return items.length > 0 && items.every((i) => Boolean(i.coverImage));
}

/**
 * Three photographs fill the mosaic (one large plus two stacked) exactly. With
 * fewer, a single wide frame beats a grid of grey boxes.
 */
export function galleryLayout(imageCount: number): "mosaic" | "single" {
  return imageCount >= 3 ? "mosaic" : "single";
}

/** Only worth counting when there are photos past the ones already on screen. */
export function galleryPillLabel(total: number): string {
  return total > 3 ? `All ${total} photos` : "View photos";
}

/**
 * A single related card looks like an error. Below two, the section becomes a
 * dates prompt instead — which is more useful anyway.
 */
export function showRelated(otherCount: number): boolean {
  return otherCount >= 2;
}
