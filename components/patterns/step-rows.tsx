// components/patterns/step-rows.tsx
//
// "Getting there". A fixed 84px mono step label keeps the bodies aligned however
// long the step numbers' labels get.
//
// Both places this appears close on the same point: transfers are booked against
// real flight numbers, so an inbound delay moves the transfer rather than losing
// it. That is the reassurance the section exists to deliver.

export interface Step {
  label: string;
  body: string;
}

export function StepRows({ steps, note }: { steps: Step[]; note?: string | null }) {
  if (steps.length === 0) return null;

  return (
    <div>
      <div>
        {steps.map((s, i) => (
          <div
            key={s.label}
            className={
              "flex items-baseline gap-5 border-t border-ink-200 py-4" +
              (i === steps.length - 1 ? " border-b" : "")
            }
          >
            <span className="shrink-0 basis-[84px] font-mono text-label-sm uppercase text-meta">
              {s.label}
            </span>
            <span className="min-w-0 text-body-s text-ink-700">{s.body}</span>
          </div>
        ))}
      </div>
      {note && (
        <p className="m-0 mt-5 max-w-[34em] text-body-xs leading-[22px] text-meta">
          {note}
        </p>
      )}
    </div>
  );
}
