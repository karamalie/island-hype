// components/patterns/closing-cta.tsx
//
// The panel that closes a page. Framed (bordered, on white) on the index pages;
// unframed on the tinted band the detail pages end with — the ground change is
// already doing the separating there, so a border would be a second device
// saying the same thing.

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface CtaAction {
  label: string;
  href: string;
}

export function ClosingCta({
  heading,
  lede,
  primary,
  secondary,
  framed = true,
  eyebrow,
}: {
  heading: string;
  lede: string;
  primary: CtaAction;
  secondary?: CtaAction;
  framed?: boolean;
  eyebrow?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-8",
        framed && "rounded-xl border border-ink-200 p-12"
      )}
    >
      <div className="min-w-0 max-w-[28em]">
        {eyebrow && (
          <div className="mb-4 font-mono text-label uppercase text-meta">{eyebrow}</div>
        )}
        <h2 className="m-0 mb-3 text-[clamp(28px,3.2vw,40px)] font-medium leading-[1.14] tracking-[-0.02em]">
          {heading}
        </h2>
        <p className="m-0 text-body-l text-ink-700">{lede}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href={primary.href}
          className="inline-flex h-[52px] items-center rounded-full bg-ink-900 px-7 text-body-m font-medium text-white transition-colors duration-[220ms] hover:bg-ink-800"
        >
          {primary.label}
        </Link>
        {secondary && (
          <Link
            href={secondary.href}
            className="inline-flex h-[52px] items-center rounded-full border border-ink-200 bg-white px-7 text-body-m font-medium text-ink-900 transition-colors duration-[220ms] hover:border-meta-inverse hover:bg-ink-50"
          >
            {secondary.label}
          </Link>
        )}
      </div>
    </div>
  );
}
