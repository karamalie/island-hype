// components/patterns/empty-panel.tsx
//
// Two devices for thin content, shaped differently because they do different jobs.
//
// SiblingPanel takes the same flex basis and max-width as a real card, so a row
// holding one package still fills its width. A dashed border says "deliberately
// not a card" where an absence would just look like a loading failure.
//
// NoResults is the centred panel for a filter that matched nothing. The active
// filter chips stay visible above it, so the cause is legible.

import Link from "next/link";
import { Label } from "@/components/ui";

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

export function NoResults({
  primary,
  secondary,
}: {
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}) {
  return (
    <div className="rounded-xl border border-ink-200 px-12 py-16 text-center">
      <Label className="mb-5">No matches</Label>
      <h2 className="mx-auto m-0 mb-4 max-w-[22em] text-[clamp(26px,3vw,36px)] font-medium leading-[1.16] tracking-[-0.02em]">
        No packages match those filters.
      </h2>
      <p className="mx-auto m-0 mb-8 max-w-[32em] text-[17px] leading-[27px] text-ink-700">
        Try widening the price or dropping a filter — or have a look at everything
        we run and work back from there.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href={primary.href}
          className="inline-flex h-[52px] items-center rounded-full bg-ink-900 px-7 text-body-m font-medium text-white hover:bg-ink-800"
        >
          {primary.label}
        </Link>
        <Link
          href={secondary.href}
          className="inline-flex h-[52px] items-center rounded-full border border-ink-200 bg-white px-7 text-body-m font-medium text-ink-900 hover:bg-ink-50"
        >
          {secondary.label}
        </Link>
      </div>
    </div>
  );
}
