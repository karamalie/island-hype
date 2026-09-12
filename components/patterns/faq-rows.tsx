// components/patterns/faq-rows.tsx
//
// "Worth knowing". Renders nothing at all when there are no items — no heading,
// no rule, no gap. An empty section heading is worse than a missing section.

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
}

export function FaqRows({ items }: { items: FaqRow[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="m-0 mb-6 text-[clamp(24px,2.6vw,32px)] font-medium leading-[1.18] tracking-[-0.015em]">
        Worth knowing
      </h2>
      <div>
        {items.map((f, i) => (
          <div
            key={f.id}
            className={
              "border-t border-ink-200 py-5" +
              (i === items.length - 1 ? " border-b" : "")
            }
          >
            <div className="mb-1.5 text-[17px] font-medium leading-6">{f.question}</div>
            <p className="m-0 max-w-[34em] text-body-s text-ink-700">{f.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
