"use client";

// components/admin/editors/faq-editor.tsx
//
// The "Worth knowing" questions on a package, island or stay page.
//
// The help text says what an empty list does, because that is the non-obvious
// part: the section does not render an empty heading, it disappears. Someone
// deleting the last question should know they are removing a whole band from the
// page rather than leaving a gap.

import { useMemo, useState } from "react";
import { FormField, inputStyles, textareaStyles } from "@/components/admin/ui/form-field";
import { Repeatable } from "@/components/admin/ui/repeatable";
import { EmptyNote, SavePanel } from "@/components/admin/ui/save-panel";
import { updateFaqs, type FaqOwner } from "@/lib/actions/editorial";

export interface FaqRow {
  question: string;
  answer: string;
}

const blank = (): FaqRow => ({ question: "", answer: "" });

export function FaqEditor({
  owner,
  initial,
  what,
}: {
  owner: FaqOwner;
  initial: FaqRow[];
  /** "package", "island" or "stay" — used in the help text. */
  what: string;
}) {
  const [rows, setRows] = useState<FaqRow[]>(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const dirty = useMemo(() => JSON.stringify(rows) !== baseline, [rows, baseline]);

  const incomplete = rows.some(
    (r) => (r.question.trim() === "") !== (r.answer.trim() === "")
  );

  return (
    <SavePanel
      title="Questions and answers"
      help={`These appear near the bottom of the ${what} page under "Worth knowing". Write the questions guests actually ask. If you remove them all, the whole section disappears from the site rather than leaving a gap.`}
      saveLabel="Save questions"
      dirty={dirty}
      onSave={async () => {
        const result = await updateFaqs(owner, rows);
        if (result.success) setBaseline(JSON.stringify(rows));
        return result;
      }}
    >
      {incomplete && (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
          A question needs an answer and an answer needs a question — rows with
          only one filled in are skipped when you save.
        </p>
      )}

      <Repeatable
        rows={rows}
        onChange={setRows}
        blank={blank}
        addLabel="Add a question"
        describe={(r) => r.question || "this question"}
        empty={
          <EmptyNote>
            No questions yet, so the &ldquo;Worth knowing&rdquo; section is hidden
            on the site. Add one and it appears.
          </EmptyNote>
        }
      >
        {(row, i, update) => (
          <>
            <FormField label="Question" description="Phrase it the way a guest would ask it.">
              <input
                id={`faq-q-${i}`}
                value={row.question}
                onChange={(e) => update({ question: e.target.value })}
                placeholder="What if our flight lands late?"
                className={inputStyles}
              />
            </FormField>
            <FormField
              label="Answer"
              description="Be specific and honest — this is where guests decide whether to trust the page."
            >
              <textarea
                id={`faq-a-${i}`}
                value={row.answer}
                onChange={(e) => update({ answer: e.target.value })}
                rows={3}
                placeholder="Speedboats run to a fixed evening schedule. If you land after the last departure we build in a night near the airport and price it before you pay."
                className={textareaStyles}
              />
            </FormField>
          </>
        )}
      </Repeatable>
    </SavePanel>
  );
}
