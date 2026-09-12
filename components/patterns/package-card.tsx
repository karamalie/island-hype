// components/patterns/package-card.tsx
//
// One data shape, three forms. Built once because it appears on four pages —
// Home, the listing grid, a location's "packages here", and the related strip on
// a detail page.
//
// The sizing rules here are defensive on purpose. Three separate defects during
// design came from intrinsic sizing inside repeated cards:
//
//   - Card titles reserve two lines (--card-title-min). Without it a one-line
//     and a two-line title push their spec rows 28px out of alignment.
//   - Price blocks anchor with margin-top:auto, so prices align across siblings
//     even when titles and blurbs differ in length.
//   - The row form's flex bases sum to 240+320+200=760, under the container.
//     flex-shrink only redistributes within a line: if bases exceed the
//     container and the parent wraps, the last child wraps instead of shrinking.
//   - The row's price rail is separated by an #F8F8F8 ground, not a left border,
//     because a left border is wrong the moment the rail wraps to full width.

import Link from "next/link";
import type { PackageCard as PackageCardData } from "@/lib/data/packages";
import { Badge, Label } from "@/components/ui";
import { cn } from "@/lib/utils";
import { distinctOfferBadge } from "@/lib/design/offers";
import { PhotoFrame } from "./photo-frame";
import { SpecSheet } from "./spec-sheet";
import { PriceBlock } from "./price-block";

export type PackageCardForm = "grid" | "row" | "compact";

export interface PackageCardProps {
  pkg: PackageCardData;
  form?: PackageCardForm;
}

function specRows(pkg: PackageCardData) {
  return [
    { label: "Stay", value: pkg.stay },
    { label: "Transfer", value: pkg.transfer },
    { label: "Meals", value: pkg.mealPlan },
  ];
}

/** "Ended" / "From March 2027". Never shown for a live package. */
function LifecycleMark({ pkg }: { pkg: PackageCardData }) {
  if (pkg.lifecycle === "ended") {
    return <Label className="text-meta">Ended</Label>;
  }
  if (pkg.lifecycle === "upcoming" && pkg.opens) {
    return <Label className="text-teal-deep">{pkg.opens}</Label>;
  }
  return null;
}

export function PackageCard({ pkg, form = "grid" }: PackageCardProps) {
  const href = `/packages/${pkg.slug}`;
  const ended = pkg.lifecycle === "ended";
  const offerBadge = distinctOfferBadge(pkg.badge, pkg.offers[0]);

  if (form === "compact") {
    return (
      <Link
        href={href}
        className={cn(
          "group flex min-w-0 flex-col overflow-hidden rounded-lg border border-ink-200 bg-white",
          "basis-[300px] grow shrink max-w-[400px]",
          ended && "opacity-55"
        )}
      >
        {pkg.photoRich && (
          <PhotoFrame
            src={pkg.coverImage}
            bucket="packages"
            alt={pkg.name}
            ratio="4 / 3"
            zoom
          />
        )}
        <div className="flex flex-1 flex-col p-5">
          <Label className="mb-2">{pkg.eyebrow}</Label>
          <div className="mb-4 min-h-[52px] text-heading-s">{pkg.name}</div>
          <div className="mt-auto flex items-baseline justify-between gap-3 border-t border-ink-200 pt-4">
            <PriceBlock price={pkg.price} size="md" className="[&>div:last-child]:hidden" />
            <span className="text-caption font-medium text-teal-deep">View →</span>
          </div>
        </div>
      </Link>
    );
  }

  if (form === "row") {
    return (
      <Link
        href={href}
        className={cn(
          "group flex flex-wrap overflow-hidden rounded-lg border border-ink-200 bg-white",
          "transition-shadow duration-[220ms] ease-[var(--ease-standard)] hover:shadow-card-hover",
          ended && "opacity-55"
        )}
      >
        {pkg.photoRich && (
          <PhotoFrame
            src={pkg.coverImage}
            bucket="packages"
            alt={pkg.name}
            className="min-h-[260px] min-w-0 shrink grow basis-[240px]"
            sizes="(max-width: 768px) 100vw, 320px"
            zoom
          >
            {/* Stacked, because the package's own badge and an offer badge can
                both be set and they would otherwise sit on top of each other.
                distinctOfferBadge drops the offer chip when it repeats the
                package's — staff use the same words for both. */}
            {(pkg.badge || offerBadge) && (
              <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
                {pkg.badge && <Badge tone="on-photo">{pkg.badge}</Badge>}
                {offerBadge && <Badge tone="offer">{offerBadge}</Badge>}
              </div>
            )}
          </PhotoFrame>
        )}

        <div className="min-w-0 shrink grow-[2] basis-[320px] p-6">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <Label>{pkg.eyebrow}</Label>
            <div className="flex shrink-0 items-center gap-2">
              <LifecycleMark pkg={pkg} />
              {!pkg.photoRich && pkg.badge && <Badge tone="tint">{pkg.badge}</Badge>}
              {!pkg.photoRich && offerBadge && (
                <Badge tone="offer">{offerBadge}</Badge>
              )}
            </div>
          </div>
          <div className="mb-4 text-heading-m">{pkg.name}</div>
          {pkg.blurb && (
            <p className="m-0 mb-5 max-w-[40em] text-body-s text-ink-700">{pkg.blurb}</p>
          )}
          <SpecSheet rows={specRows(pkg)} layout="grid3" />
        </div>

        {/* Ground change, not a border. See the note at the top. */}
        <div className="flex min-w-0 shrink basis-[200px] flex-col items-start justify-end gap-4 bg-ink-50 p-6">
          <PriceBlock price={pkg.price} size="lg" />
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex h-11 items-center rounded-full bg-ink-900 px-5 text-body-xs font-medium text-white">
              See the package
            </span>
            <span className="inline-flex h-11 items-center rounded-full border border-ink-200 bg-white px-5 text-body-xs font-medium text-ink-900">
              Check my dates
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Grid form.
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-w-0 shrink grow basis-[340px] max-w-[420px] flex-col overflow-hidden",
        "rounded-lg border border-ink-200 bg-white",
        "transition-[box-shadow,transform] duration-[220ms] ease-[var(--ease-standard)]",
        "hover:-translate-y-0.5 hover:shadow-card-hover",
        ended && "opacity-55"
      )}
    >
      {pkg.photoRich && (
        <PhotoFrame
          src={pkg.coverImage}
          bucket="packages"
          alt={pkg.name}
          ratio="4 / 3"
          zoom
        >
          {/* Stacked: a package badge and an offer badge can both be set. */}
          {(pkg.badge || offerBadge) && (
            <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
              {pkg.badge && <Badge tone="on-photo">{pkg.badge}</Badge>}
              {offerBadge && <Badge tone="offer">{offerBadge}</Badge>}
            </div>
          )}
        </PhotoFrame>
      )}

      {/* 20px on a card with an image well. One padding value per page. */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <Label>{pkg.eyebrow}</Label>
          <div className="flex shrink-0 items-center gap-2">
            <LifecycleMark pkg={pkg} />
            {!pkg.photoRich && pkg.badge && <Badge tone="tint">{pkg.badge}</Badge>}
              {!pkg.photoRich && offerBadge && (
                <Badge tone="offer">{offerBadge}</Badge>
              )}
          </div>
        </div>

        {/* Two lines reserved. This is the alignment fix. */}
        <div
          className="mb-[18px] text-card-title"
          style={{ minHeight: "var(--card-title-min)" }}
        >
          {pkg.name}
        </div>

        <SpecSheet rows={specRows(pkg)} className="mb-5" />

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
          <PriceBlock price={pkg.price} size="md" />
          <span className="inline-flex h-10 items-center rounded-full bg-ink-900 px-5 text-body-xs font-medium text-white">
            See the package
          </span>
        </div>
      </div>
    </Link>
  );
}
