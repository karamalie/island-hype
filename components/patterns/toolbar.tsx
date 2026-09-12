// components/patterns/toolbar.tsx
//
// The count, the hint and the filter affordances above a listing.
//
// What shows is derived from how many results there are, never from a prop a
// page chose: quick pills between three and five, the full bar and sort at six
// and up. Filtering two results is theatre, and a page that offers it looks
// like a page with nothing on it.
//
// Filter state lives in the URL, read server-side from searchParams. No client
// state library — nuqs was declared in package.json and used in zero files.

import Link from "next/link";
import type { ListDensity } from "@/lib/design/density";
import { Label } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface ToolbarTag {
  name: string;
  slug: string;
  count: number;
}

export interface ToolbarProps {
  count: string;
  hint: string;
  density: ListDensity;
  tags: ToolbarTag[];
  activeTag: string | null;
  basePath: string;
}

export function Toolbar({
  count,
  hint,
  density,
  tags,
  activeTag,
  basePath,
}: ToolbarProps) {
  const showPills = density.quickPills || density.filterBar;

  return (
    <div className="border-b border-ink-200 bg-white">
      <div className="mx-auto flex w-full max-w-[var(--container-page)] flex-wrap items-center justify-between gap-5 px-[var(--gutter)] py-5">
        <div className="flex flex-wrap items-baseline gap-4">
          <span className="text-body-s font-medium">{count}</span>
          <span className="text-body-xs text-meta">{hint}</span>
        </div>

        {showPills && tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <FilterLink href={basePath} active={!activeTag}>
              All
            </FilterLink>
            {tags.map((t) => (
              <FilterLink
                key={t.slug}
                href={`${basePath}?tag=${t.slug}`}
                active={activeTag === t.slug}
              >
                {t.name}
              </FilterLink>
            ))}
          </div>
        )}
      </div>

      {activeTag && (
        // Stays above the no-results panel, so the cause of zero results is legible.
        <div className="mx-auto flex w-full max-w-[var(--container-page)] flex-wrap items-center gap-2 px-[var(--gutter)] pb-5">
          <Label className="mr-1 text-label-sm">Filtering by</Label>
          <span className="inline-flex h-8 items-center gap-2 rounded-full border border-teal-bright bg-teal-tint px-3.5 text-caption font-medium text-teal-deep">
            {tags.find((t) => t.slug === activeTag)?.name ?? activeTag}
            <Link href={basePath} aria-label="Clear this filter" className="text-teal-deep">
              ×
            </Link>
          </span>
          <Link href={basePath} className="ml-1 text-caption text-meta hover:text-ink-900">
            Clear all
          </Link>
        </div>
      )}
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full px-4 text-body-xs transition-colors duration-[140ms]",
        active
          ? "bg-ink-900 font-medium text-white"
          : "border border-ink-200 bg-white text-ink-700 hover:border-meta-inverse hover:bg-ink-50"
      )}
    >
      {children}
    </Link>
  );
}
