"use client";

// components/guide/contents-rail.tsx
//
// The sticky contents rail. Scroll-spy via IntersectionObserver rather than a
// scroll handler, so it costs nothing while the reader is just reading.
//
// The rail does NOT make the measure safe on its own — the prose beside it is
// still capped at 34em, because a 520px column of 17px type is already at the
// limit of comfortable reading.

import { useEffect, useState } from "react";

export interface ContentsItem {
  id: string;
  label: string;
}

export function ContentsRail({ items }: { items: ContentsItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      // Bias the band towards the top of the viewport: the heading you have just
      // scrolled past is the section you are actually in.
      { rootMargin: "-80px 0px -65% 0px", threshold: 0 }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Contents" className="sticky top-6">
      <div className="mb-4 font-mono text-label-sm uppercase text-meta">Contents</div>
      <ol className="m-0 list-none p-0">
        {items.map((item, i) => (
          <li key={item.id} className="border-t border-ink-200 last:border-b">
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "true" : undefined}
              className={`flex items-baseline gap-3 py-2.5 text-body-xs transition-colors duration-[140ms] ${
                active === item.id
                  ? "font-medium text-ink-900"
                  : "text-ink-700 hover:text-ink-900"
              }`}
            >
              <span
                className={`shrink-0 font-mono text-label-sm ${
                  active === item.id ? "text-teal-deep" : "text-meta"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
