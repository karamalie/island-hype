// components/patterns/editorial-split.tsx
//
// A portrait photograph beside a block of argument. Two of these carry Home's
// visual weight, which is deliberate: the launch photography budget is small, and
// one strong 4:5 frame does more than a grid of weak ones.
//
// auto-fit with a 300px minimum collapses to stacked without a media query, and
// the order swap means the image="right" variant still stacks text-first on a
// phone rather than leading with a photograph the reader has to scroll past.

import { Label, Mark } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { StorageBucket } from "@/lib/image-urls";
import { PhotoFrame } from "./photo-frame";

export interface SplitRow {
  /** A numeral ("01") or null for a ✦ mark. */
  index?: string;
  text: string;
}

export interface EditorialSplitProps {
  image: "left" | "right";
  src: string | null;
  bucket: StorageBucket;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  rows: SplitRow[];
  link?: { label: string; href: string };
  /**
   * The frame's aspect. Portrait by default, which suits a tall column of prose.
   *
   * It is a prop because the image has to be able to decide: the "why here"
   * section shows a whole island ringed by reef, and a 4:5 crop of a 1.28:1
   * landscape cuts both ends off the island — losing exactly the thing the
   * section is arguing.
   */
  ratio?: string;
}

export function EditorialSplit({
  image,
  src,
  bucket,
  alt,
  ratio = "4 / 5",
  eyebrow,
  title,
  body,
  rows,
  link,
}: EditorialSplitProps) {
  const frame = (
    <PhotoFrame
      src={src}
      bucket={bucket}
      alt={alt}
      ratio={ratio}
      radius="xl"
      className={cn("min-w-0 max-h-[520px]", image === "right" && "order-2")}
      sizes="(max-width: 768px) 100vw, 560px"
    />
  );

  const copy = (
    <div className={cn("min-w-0", image === "right" && "order-1")}>
      <Label className="mb-4">{eyebrow}</Label>
      <h2 className="m-0 mb-5 text-display-m">{title}</h2>
      <p className="m-0 mb-7 max-w-[34em] text-body-l text-ink-700">{body}</p>
      <div className="mb-7 flex flex-col">
        {rows.map((r) => (
          <div
            key={r.text}
            className="flex items-baseline gap-4 border-b border-ink-200 py-3.5"
          >
            {r.index ? (
              <span className="shrink-0 font-mono text-label text-teal-bright">
                {r.index}
              </span>
            ) : (
              <Mark className="text-[12px]" />
            )}
            <span className="text-body-s text-ink-700">{r.text}</span>
          </div>
        ))}
      </div>
      {link && (
        <a
          href={link.href}
          className="text-body-s font-medium text-teal-deep hover:text-ink-900"
        >
          {link.label} →
        </a>
      )}
    </div>
  );

  return (
    <div
      className="grid items-center gap-14"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
    >
      {image === "left" ? (
        <>
          {frame}
          {copy}
        </>
      ) : (
        <>
          {copy}
          {frame}
        </>
      )}
    </div>
  );
}
