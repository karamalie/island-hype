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
  packages: {
    slug: string;
    id: string;
    name: string;
    eyebrow: string;
    /** Named in the prefilled mail, so a reply does not have to ask. */
    locationName: string;
    stay: string | null;
  }[];
  /** Preselected when arriving from a package page. */
  initialPackageId?: string;
  /** Where the enquiry is addressed, and the address a reply comes from. */
  replyFrom?: string;
}

export function EnquiryForm({ packages, initialPackageId, replyFrom }: EnquiryFormProps) {
  const [state, setState] = useState<"idle" | "sent">("idle");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const get = (k: string) => String(data.get(k) ?? "").trim();
    const packageId = get("packageId");
    const chosen = packages.find((p) => p.id === packageId);

    const lines = [
      `Name: ${get("name")}`,
      `Email: ${get("email")}`,
      `Package: ${chosen ? chosen.name : "Still deciding"}`,
      ...(chosen
        ? [`Island: ${chosen.locationName}`, ...(chosen.stay ? [`Stay: ${chosen.stay}`] : [])]
        : []),
      `Arrival: ${get("arrival") || "not set"}`,
      `Nights: ${get("nights")}`,
      `Travelling: ${get("adults")} adults`,
      "",
      get("message") || "(no message)",
    ];
    if (data.get("optin")) lines.push("", "Happy to hear when a new island opens.");

    const subject = chosen ? `Enquiry — ${chosen.name}` : "Maldives package enquiry";
    const href = `mailto:${replyFrom}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;

    // Opened synchronously inside the click, before anything is awaited. An
    // await here ends the user-activation window and the browser refuses to
    // hand off to the mail client.
    window.location.href = href;

    // Still recorded, and deliberately not awaited: the guest is already in
    // their mail client, and a slow or failing write must not sit in front of
    // them with an error they cannot act on.
    setState("sent");
    void submitDateEnquiry(data).catch(() => {
      /* the enquiry is in their outbox either way */
    });
  }

  if (state === "sent") {
    return (
      <div className="rounded-lg border border-ink-200 border-l-[3px] border-l-teal-bright bg-teal-tint p-6">
        <div className="mb-1.5 font-mono text-label-sm uppercase text-teal-deep">Sent</div>
        <p className="m-0 text-body-xs leading-[22px] text-ink-900">
          Your email app should have opened with all of this filled in
          {replyFrom ? <> to <strong className="font-medium">{replyFrom}</strong></> : null}.
          Press send there and you&rsquo;ll hear back from a person, usually
          within a few hours. If nothing opened, email us directly.
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


      {/* No loading state: the handler hands off to the mail client
          synchronously, so there is nothing to wait for. */}
      <Button type="submit" size="lg" className="w-full">
        Write the enquiry
      </Button>
      <p className="m-0 mt-4 text-center text-caption leading-5 text-meta">
        No payment now, and nothing is held until you&rsquo;ve seen the total.
      </p>
    </form>
  );
}
