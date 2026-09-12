// components/patterns/stay-card.tsx
//
// An island or boat, in the same two forms as the package card and switching on
// the same threshold. Distinct from StayTypeCard, which is one of the five kinds
// of night rather than a specific place.

import Link from "next/link";
import type { StayCard as StayCardData } from "@/lib/data/accommodations";
import { Badge, Label } from "@/components/ui";
import { formatMoney } from "@/lib/design/pricing";
import { cn } from "@/lib/utils";
import { PhotoFrame } from "./photo-frame";
import { SpecSheet } from "./spec-sheet";

function nightly(stay: StayCardData) {
  if (stay.nightlyFrom === null) return null;
  return formatMoney(stay.nightlyFrom, "USD");
}

export function StayCard({
  stay,
  form = "grid",
}: {
  stay: StayCardData;
  form?: "grid" | "row";
}) {
  const href = `/accommodations/${stay.slug}`;
  const from = nightly(stay);

  if (form === "row") {
    return (
      <Link
        href={href}
        className="group flex flex-wrap overflow-hidden rounded-lg border border-ink-200 bg-white transition-shadow duration-[220ms] ease-[var(--ease-standard)] hover:shadow-card-hover"
      >
        {stay.photoRich && (
          <PhotoFrame
            src={stay.coverImage}
            bucket="accommodations"
            alt={stay.name}
            className="min-h-[260px] min-w-0 shrink grow basis-[240px]"
            sizes="(max-width: 768px) 100vw, 320px"
            zoom
          >
            <Badge tone="on-photo" className="absolute left-4 top-4">
              {stay.typeLabel}
            </Badge>
          </PhotoFrame>
        )}

        <div className="min-w-0 shrink grow-[2] basis-[320px] p-6">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <Label>{stay.islandName}</Label>
            {!stay.photoRich && <Badge tone="tint">{stay.typeLabel}</Badge>}
          </div>
          <div className="mb-4 text-heading-m">{stay.name}</div>
          {stay.blurb && (
            <p className="m-0 mb-5 max-w-[40em] text-body-s text-ink-700">{stay.blurb}</p>
          )}
          <SpecSheet
            layout="grid3"
            rows={[
              { label: "Rooms", value: stay.rooms },
              { label: "Board", value: stay.board },
              { label: "Transfer", value: stay.transfer },
            ]}
          />
        </div>

        <div className="flex min-w-0 shrink basis-[200px] flex-col items-start justify-end gap-4 bg-ink-50 p-6">
          <div>
            {from ? (
              <>
                <div>
                  <span className="text-[26px] font-semibold leading-8">{from}</span>
                  <span className="text-caption text-meta"> / night</span>
                </div>
                <div className="mt-0.5 text-caption text-meta">{stay.packagesLine}</div>
              </>
            ) : (
              <div className="text-caption text-meta">{stay.packagesLine}</div>
            )}
          </div>
          <span className="inline-flex h-11 items-center rounded-full bg-ink-900 px-5 text-body-xs font-medium text-white">
            See the stay
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex min-w-0 shrink grow basis-[300px] max-w-[400px] flex-col overflow-hidden",
        "rounded-lg border border-ink-200 bg-white",
        "transition-[box-shadow,transform] duration-[220ms] ease-[var(--ease-standard)]",
        "hover:-translate-y-0.5 hover:shadow-card-hover"
      )}
    >
      {stay.photoRich && (
        <PhotoFrame
          src={stay.coverImage}
          bucket="accommodations"
          alt={stay.name}
          ratio="4 / 3"
          zoom
        >
          <Badge tone="on-photo" className="absolute left-4 top-4">
            {stay.typeLabel}
          </Badge>
        </PhotoFrame>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <Label>{stay.islandName}</Label>
          {!stay.photoRich && <Badge tone="tint">{stay.typeLabel}</Badge>}
        </div>
        <div className="mb-3.5 min-h-[52px] text-heading-s">{stay.name}</div>
        <SpecSheet
          className="mb-[18px]"
          rows={[
            { label: "Rooms", value: stay.rooms },
            { label: "Transfer", value: stay.transfer },
          ]}
        />
        <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
          <div>
            {from ? (
              <>
                <div>
                  <span className="text-heading-s font-semibold">{from}</span>
                  <span className="text-caption text-meta"> / night</span>
                </div>
                <div className="mt-0.5 text-caption text-meta">{stay.packagesLine}</div>
              </>
            ) : (
              <div className="text-caption text-meta">{stay.packagesLine}</div>
            )}
          </div>
          <span className="text-caption font-medium text-teal-deep">View →</span>
        </div>
      </div>
    </Link>
  );
}
