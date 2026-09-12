// components/guide/prose.tsx
//
// The article's furniture. These are the devices the guide's prose actually needs
// — a data table, a recommendation callout, a pull quote, a two-column compare,
// a price list — and they are components rather than markdown because each one
// carries structure that a rich-text editor would flatten.

import { Mark } from "@/components/ui";
import { cn } from "@/lib/utils";

/** Every paragraph in the article. Capped at 34em regardless of column width. */
export function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("m-0 mb-5 max-w-[34em] text-[17px] leading-7 text-ink-700", className)}>
      {children}
    </p>
  );
}

export function H2({ id, num, children }: { id: string; num: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 scroll-mt-24" id={id}>
      <div className="mb-3 font-mono text-label text-teal-deep">{num}</div>
      <h2 className="m-0 text-[clamp(28px,3.2vw,40px)] font-medium leading-[1.14] tracking-[-0.02em]">
        {children}
      </h2>
    </div>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="m-0 mb-3 mt-10 text-heading-s">{children}</h3>
  );
}

/** A fixed-track table. Scrolls in its own container so the page never does. */
export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  const cols = `repeat(${headers.length}, minmax(0, 1fr))`;
  return (
    <div className="mb-6 max-w-[34em] overflow-x-auto rounded-lg border border-ink-200">
      <div className="min-w-[420px]">
        <div
          className="grid gap-4 border-b border-ink-200 bg-ink-50 px-4 py-3"
          style={{ gridTemplateColumns: cols }}
        >
          {headers.map((h) => (
            <span key={h} className="font-mono text-label-sm uppercase text-meta">
              {h}
            </span>
          ))}
        </div>
        {rows.map((r, i) => (
          <div
            key={i}
            className="grid gap-4 border-b border-ink-200 px-4 py-3 last:border-b-0"
            style={{ gridTemplateColumns: cols }}
          >
            {r.map((cell, j) => (
              <span
                key={j}
                className={cn(
                  "min-w-0 text-body-xs",
                  j === 0 ? "font-medium text-ink-900" : "text-ink-700"
                )}
              >
                {cell}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Our own recommendation, set apart from the neutral explanation around it. */
export function Callout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 max-w-[34em] rounded-lg border border-ink-200 bg-ink-50 p-5">
      <div className="mb-2 font-mono text-label-sm uppercase text-teal-deep">{label}</div>
      <p className="m-0 text-body-s text-ink-900">{children}</p>
    </div>
  );
}

/** No italics — the brief is explicit. The rule carries the emphasis. */
export function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="m-0 mb-6 max-w-[34em] border-l-2 border-teal-bright pl-5 text-[19px] leading-[30px] text-ink-900">
      {children}
    </blockquote>
  );
}

export function CompareCards({
  cards,
}: {
  cards: { title: string; items: { text: string; negative?: boolean }[] }[];
}) {
  return (
    <div className="mb-6 flex max-w-[34em] flex-wrap gap-4">
      {cards.map((c) => (
        <div
          key={c.title}
          className="min-w-0 shrink grow basis-[220px] rounded-lg border border-ink-200 bg-white p-5"
        >
          <div className="mb-3 text-body-s font-medium">{c.title}</div>
          {c.items.map((it) => (
            <div key={it.text} className="flex items-baseline gap-2.5 py-1.5">
              {it.negative ? (
                <span aria-hidden="true" className="shrink-0 text-[12px] text-meta-inverse">
                  —
                </span>
              ) : (
                <Mark className="text-[12px]" />
              )}
              <span className="text-body-xs leading-[21px] text-ink-700">{it.text}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Label/value hairlines — costs, phrases, stats. */
export function ValueRows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className="mb-6 max-w-[34em]">
      {rows.map((r, i) => (
        <div
          key={r.label}
          className={cn(
            "flex items-baseline justify-between gap-4 border-t border-ink-200 py-3",
            i === rows.length - 1 && "border-b"
          )}
        >
          <span className="text-body-s text-ink-700">{r.label}</span>
          <span className="shrink-0 text-body-s font-medium text-ink-900">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

export function MarkList({ items }: { items: string[] }) {
  return (
    <div className="mb-6 max-w-[34em]">
      {items.map((t) => (
        <div key={t} className="flex items-baseline gap-3 border-b border-ink-200 py-3">
          <Mark className="text-[12px]" />
          <span className="text-body-s text-ink-700">{t}</span>
        </div>
      ))}
    </div>
  );
}

/** The four headline numbers in the geography section. */
export function StatRow({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <div
      className="mb-6 grid max-w-[34em] gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))" }}
    >
      {stats.map((s) => (
        <div key={s.label} className="border-t border-ink-200 pt-3">
          <div className="mb-1 font-mono text-label-sm uppercase text-meta">{s.label}</div>
          <div className="text-heading-s">{s.value}</div>
        </div>
      ))}
    </div>
  );
}
