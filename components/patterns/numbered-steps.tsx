// components/patterns/numbered-steps.tsx
//
// Numbered markers are only legitimate when the content genuinely is a sequence,
// and both uses here are: how a booking happens, and what happens after you send
// an enquiry. The numerals carry order the reader needs.

export interface NumberedStep {
  title: string;
  body: string;
}

export function NumberedSteps({ steps }: { steps: NumberedStep[] }) {
  return (
    <div className="flex flex-wrap gap-6">
      {steps.map((s, i) => (
        <div
          key={s.title}
          className="min-w-0 shrink grow basis-[240px] max-w-[380px] rounded-lg border border-ink-200 bg-white p-6"
        >
          <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-tint font-mono text-body-xs font-medium text-teal-deep">
            {String(i + 1).padStart(2, "0")}
          </div>
          <div className="mb-2 text-heading-s">{s.title}</div>
          <p className="m-0 text-body-s text-ink-700">{s.body}</p>
        </div>
      ))}
    </div>
  );
}
