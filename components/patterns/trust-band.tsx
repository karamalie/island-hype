// components/patterns/trust-band.tsx
//
// Three claims and a location line, on a single hairline. Sits directly under the
// hero because it answers the question the hero raises: who is selling this.

import { Mark } from "@/components/ui";

export function TrustBand({
  claims,
  meta,
}: {
  claims: string[];
  meta: string;
}) {
  return (
    <div className="border-b border-ink-200 bg-white">
      <div className="mx-auto flex w-full max-w-[var(--container-page)] flex-wrap items-center justify-between gap-8 px-[var(--gutter)] py-6">
        <div className="flex flex-wrap gap-8">
          {claims.map((c) => (
            <div key={c} className="flex items-baseline gap-2.5">
              <Mark className="font-mono text-[12px]" />
              <span className="text-body-xs text-ink-700">{c}</span>
            </div>
          ))}
        </div>
        <span className="font-mono text-label uppercase text-meta">{meta}</span>
      </div>
    </div>
  );
}
