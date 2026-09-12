// components/patterns/empty-panel.tsx
//
// Two devices for thin content, shaped differently because they do different jobs.
//
// SiblingPanel takes the same flex basis and max-width as a real card, so a row
// holding one package still fills its width. A dashed border says "deliberately
// not a card" where an absence would just look like a loading failure.
//
// EmptyState is the centred panel for a band that has nothing to show. It takes
// its copy rather than owning it, because the reason a band is empty changes what
// the visitor should be told, and getting that wrong is worse than saying nothing:
// this component used to hardcode "No packages match those filters. Try widening
// the price or dropping a filter", which is confidently wrong advice when the
// truth is that the catalogue itself is empty and the visitor never set a filter.
//
// So the rule for every caller: say what is actually true, and offer the visitor
// something they can do next. Never blame a filter that was not applied, and
// never leave a band with no explanation at all — an unexplained gap reads as a
// broken page.

import Link from "next/link";
import { Label } from "@/components/ui";
import { cn } from "@/lib/utils";

export function SiblingPanel({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string;
  title: string;
  body: string;
  action: { label: string; href: string };
}) {
  return (
    <div className="flex min-w-0 shrink grow basis-[340px] max-w-[420px] flex-col justify-center rounded-lg border border-dashed border-meta-inverse p-8">
      <Label className="mb-4">{eyebrow}</Label>
      <div className="mb-2.5 text-card-title">{title}</div>
      <p className="m-0 mb-6 text-body-s text-ink-700">{body}</p>
      <Link
        href={action.href}
        className="inline-flex h-11 items-center self-start rounded-full border border-ink-200 bg-white px-5 text-body-xs font-medium text-ink-900 hover:bg-ink-50"
      >
        {action.label}
      </Link>
    </div>
  );
}

export interface EmptyStateAction {
  label: string;
  href: string;
}

export function EmptyState({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  /** "band" is the full-width centred panel; "inset" is a quieter in-section box. */
  size = "band",
  className,
}: {
  eyebrow: string;
  title: string;
  body: string;
  primary?: EmptyStateAction;
  secondary?: EmptyStateAction;
  size?: "band" | "inset";
  className?: string;
}) {
  const band = size === "band";
  return (
    <div
      className={cn(
        "rounded-xl border border-ink-200 text-center",
        band ? "px-6 py-16 sm:px-12" : "px-6 py-10",
        className
      )}
    >
      <Label className="mb-5">{eyebrow}</Label>
      <h2
        className={cn(
          "mx-auto m-0 mb-4 max-w-[22em] font-medium tracking-[-0.02em]",
          band
            ? "text-[clamp(24px,3vw,36px)] leading-[1.16]"
            : "text-[clamp(20px,2.2vw,26px)] leading-[1.2]"
        )}
      >
        {title}
      </h2>
      <p className="mx-auto m-0 max-w-[32em] text-body-l text-ink-700">{body}</p>

      {(primary || secondary) && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {primary && (
            <Link
              href={primary.href}
              className="inline-flex h-[52px] items-center rounded-full bg-ink-900 px-7 text-body-m font-medium text-white hover:bg-ink-800"
            >
              {primary.label}
            </Link>
          )}
          {secondary && (
            <Link
              href={secondary.href}
              className="inline-flex h-[52px] items-center rounded-full border border-ink-200 bg-white px-7 text-body-m font-medium text-ink-900 hover:bg-ink-50"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
