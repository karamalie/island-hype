"use client";

// components/contact/enquiry-form.tsx
//
// The form leads with WHICH PACKAGE, as a select rather than a free-text field,
// because a fixed package is the thing the business sells. Asking "how can we
// help?" first would invite a brief we do not fulfil.
//
// Sent and error states are mutually exclusive here — the prototype showed both
// at once so they could be reviewed side by side. Neither uses red: a missing
// email address is not an emergency.

import { useState } from "react";
import { submitDateEnquiry } from "@/lib/actions/enquiry";
import { Button, FieldLabel, Input, Select, Textarea } from "@/components/ui";

export interface EnquiryFormProps {
  packages: { slug: string; id: string; name: string; eyebrow: string }[];
  /** Preselected when arriving from a package page. */
  initialPackageId?: string;
  /** Shown in the sent state, so the reply is expected from a named address. */
  replyFrom?: string;
}

export function EnquiryForm({ packages, initialPackageId, replyFrom }: EnquiryFormProps) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError(null);
    const result = await submitDateEnquiry(new FormData(e.currentTarget));
    if (result.success) {
      setState("sent");
    } else {
      setState("error");
      setError(result.error ?? "Something went wrong.");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-lg border border-ink-200 border-l-[3px] border-l-teal-bright bg-teal-tint p-6">
        <div className="mb-1.5 font-mono text-label-sm uppercase text-teal-deep">Sent</div>
        <p className="m-0 text-body-xs leading-[22px] text-ink-900">
          Thanks — that&rsquo;s with us. You&rsquo;ll hear back from a person
          {replyFrom ? <> at <strong className="font-medium">{replyFrom}</strong></> : null},
          usually within a few hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-ink-200 bg-white p-8">
      <div className="mb-5 flex flex-wrap gap-4">
        <div className="min-w-0 shrink grow basis-[200px]">
          <FieldLabel htmlFor="c-name">Your name</FieldLabel>
          <Input id="c-name" name="name" required placeholder="First and last" />
        </div>
        <div className="min-w-0 shrink grow basis-[200px]">
          <FieldLabel htmlFor="c-email">Email</FieldLabel>
          <Input
            id="c-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="mb-5">
        <FieldLabel htmlFor="c-package">Which package?</FieldLabel>
        <Select id="c-package" name="packageId" defaultValue={initialPackageId ?? ""}>
          <option value="">Still deciding</option>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.eyebrow} — {p.name}
            </option>
          ))}
        </Select>
        <div className="mt-2 text-caption leading-5 text-meta">
          Not sure yet? Leave it on &ldquo;Still deciding&rdquo; and say what
          you&rsquo;re after below.
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-4">
        <div className="min-w-0 shrink grow basis-[140px]">
          <FieldLabel htmlFor="c-arrival">Arrival</FieldLabel>
          <Input id="c-arrival" name="arrival" type="date" />
        </div>
        <div className="min-w-0 shrink grow basis-[140px]">
          <FieldLabel htmlFor="c-nights">Nights</FieldLabel>
          <Select id="c-nights" name="nights" defaultValue="4">
            {[3, 4, 5, 6, 7, 8, 9, 10, 12, 14].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </Select>
        </div>
        <div className="min-w-0 shrink grow basis-[140px]">
          <FieldLabel htmlFor="c-adults">Travelling</FieldLabel>
          <Select id="c-adults" name="adults" defaultValue="2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "adult" : "adults"}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mb-5">
        <FieldLabel htmlFor="c-message">Anything we should know?</FieldLabel>
        <Textarea
          id="c-message"
          name="message"
          placeholder="Flight times if you have them, an occasion, dietary needs, whether you dive — anything that changes what we'd recommend."
        />
      </div>

      <label className="mb-6 flex items-start gap-3">
        <input
          id="c-optin"
          name="optin"
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 rounded-[4px] border border-meta-inverse accent-teal-deep"
        />
        <span className="text-body-xs leading-[22px] text-ink-700">
          Send me a note when we open a new island. A few times a year at most.
        </span>
      </label>

      {state === "error" && error && (
        <div className="mb-5 border-l-[3px] border-meta-inverse bg-ink-50 p-4">
          <div className="mb-1.5 font-mono text-label-sm uppercase text-meta">
            Needs attention
          </div>
          <p className="m-0 text-body-xs leading-[22px] text-ink-900">{error}</p>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" isLoading={state === "sending"}>
        Send the enquiry
      </Button>
      <p className="m-0 mt-4 text-center text-caption leading-5 text-meta">
        No payment now, and nothing is held until you&rsquo;ve seen the total.
      </p>
    </form>
  );
}
