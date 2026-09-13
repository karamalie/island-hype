"use client";

// components/patterns/booking-rail.tsx
//
// The sticky rail on a detail page. The only card in the system with a resting
// shadow, because it is the one thing on the page that should read as lifted off
// it rather than set into it.
//
// Do not wrap this in a container with overflow:hidden — sticky positioning
// works inside a flex child, but an overflow ancestor silently kills it.
//
// Errors get a grey left border on the tinted ground, never red. The brief is
// explicit: a date that doesn't work is not an emergency, and the page should not
// shout at someone for asking.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, FieldLabel, Input, Mark, Select } from "@/components/ui";
import { checkDates, type Blackout, type PackageLifecycle } from "@/lib/design/availability";
import { submitDateEnquiry } from "@/lib/actions/enquiry";
import { whatsappHref } from "@/lib/data/settings";
import { PriceBlock } from "./price-block";
import type { PackagePrice } from "@/lib/design/pricing";

export interface BookingRailProps {
  packageId: string;
  packageName: string;
  price: PackagePrice | null;
  /** The package's length. Not a choice — the arrival date is the only choice. */
  nights: number;
  lifecycle: PackageLifecycle;
  travel: { start: Date | null; end: Date | null };
  booking: { start: Date | null; end: Date | null };
  blackouts: Blackout[];
  /** Occupancy of the stay this package is sold against. Null = not recorded. */
  maxAdults: number | null;
  maxChildren: number | null;
  /** Where "Check these dates" goes. Null hides the WhatsApp path entirely. */
  whatsappNumber: string | null;
  /**
   * The island's own terms and privacy text. Per location rather than per site:
   * a guest is agreeing to the resort's conditions, and those differ by resort.
   * Null or blank falls back to the site-wide pages so the links always lead
   * somewhere.
   */
  termsText: string | null;
  privacyText: string | null;
}

/**
 * Date-only formatting in UTC, deliberately.
 *
 * These dates come out of MySQL at UTC midnight and go into an <input
 * type="date">, which speaks bare YYYY-MM-DD. Formatting them through local
 * getters would shift the day for anyone west of Greenwich, so a travel window
 * ending on the 22nd would stop admitting the 22nd.
 */
function isoDate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}

/** "Sun 16 Nov 2026", for stating the departure a guest did not have to work out. */
function humanDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}

export function BookingRail(props: BookingRailProps) {
  const [arrival, setArrival] = useState("");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [accepted, setAccepted] = useState(false);
  /** Which policy is expanded inline, if any. */
  const [showing, setShowing] = useState<"terms" | "privacy" | null>(null);
  const [state, setState] = useState<"idle" | "sent">("idle");

  const ended = props.lifecycle === "ended";

  // The picker's own bounds. A guest should not be able to choose a date the
  // package cannot take and only learn so from a message underneath.
  const today = new Date();
  const todayIso = isoDate(
    new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
  );
  const windowStart = props.travel.start ? isoDate(props.travel.start) : null;
  const minArrival = windowStart && windowStart > todayIso ? windowStart : todayIso;
  const maxArrival = props.travel.end ? isoDate(props.travel.end) : undefined;

  // Occupancy comes from the stay. Where it has not been recorded, the package's
  // own ceiling stands in, and four is the last resort — the number the selector
  // offered before any of this existed.
  const adultCap = Math.max(1, props.maxAdults ?? 4);
  const childCap = Math.max(0, props.maxChildren ?? 0);

  // Runs as the guest types. The server runs the same function again on submit.
  const verdict = useMemo(() => {
    if (!arrival) return null;
    const date = new Date(arrival);
    if (Number.isNaN(date.getTime())) return null;
    return checkDates({
      arrival: date,
      nights: props.nights,
      travel: props.travel,
      booking: props.booking,
      blackouts: props.blackouts,
    });
  }, [arrival, props.nights, props.travel, props.booking, props.blackouts]);

  const blocked = verdict !== null && !verdict.ok;

  /**
   * What the guest is about to send, in words. Built here rather than on the
   * server because it has to exist before any await — see onSubmit.
   */
  function whatsappMessage(name: string, email: string): string {
    const lines = [
      `Hi Island Hype — I'd like to check these dates.`,
      ``,
      `Package: ${props.packageName}`,
    ];
    if (arrival) {
      lines.push(`Arrival: ${humanDate(arrival)}`);
      lines.push(
        `${props.nights} ${props.nights === 1 ? "night" : "nights"}, departing ${humanDate(
          addDays(arrival, props.nights)
        )}`
      );
    }
    const kids = Number(children);
    lines.push(
      `Guests: ${adults} ${Number(adults) === 1 ? "adult" : "adults"}${
        kids > 0 ? ` and ${kids} ${kids === 1 ? "child" : "children"}` : ""
      }`
    );
    if (props.price) {
      lines.push(
        `Price shown: ${props.price.currency === "MVR" ? "MVR " : "$"}${props.price.total.toLocaleString()} total`
      );
    }
    lines.push(``, `Name: ${name}`, `Email: ${email}`);
    return lines.join("\n");
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    data.set("packageId", props.packageId);
    data.set("nights", String(props.nights));
    data.set("adults", adults);
    data.set("children", children);

    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");

    // Opened synchronously, inside the gesture that triggered it. Anything
    // awaited first — including the enquiry write — ends the user-activation
    // window and the browser blocks the tab as a popup.
    if (props.whatsappNumber) {
      window.open(
        whatsappHref(props.whatsappNumber, whatsappMessage(name, email)),
        "_blank",
        "noopener,noreferrer"
      );
    }

    // Recorded as well, and deliberately not awaited. The guest is already in
    // WhatsApp; a slow or failing write here must not hold that up or replace
    // the confirmation with an error about something they cannot act on.
    setState("sent");
    void submitDateEnquiry(data).catch(() => {
      /* the enquiry is in WhatsApp either way */
    });
  }

  if (state === "sent") {
    return (
      <Card variant="elevated" className="p-6">
        <div className="border-l-[3px] border-teal-bright bg-teal-tint p-5">
          <div className="mb-1.5 font-mono text-label-sm uppercase text-teal-deep">Sent</div>
          <p className="m-0 text-body-xs leading-[22px] text-ink-900">
            Thanks — that&rsquo;s with us. You&rsquo;ll hear back from a person in
            Male&rsquo;, usually within a few hours.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="p-6">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        {/* No hiding class here any more, and that is the fix rather than a
            tidy-up. PriceBlock used to render two divs — a big per-person
            figure and a smaller total beneath it — and the rail hid the second
            with [&>div:last-child]:hidden because it stated the total itself
            just below. Collapsing the block to a single price left that
            selector pointing at the only div it has, so the rail rendered no
            price at all: just the grey line underneath, reading as a stray
            subheading. */}
        <PriceBlock price={props.price} size="lg" />
        <span className="font-mono text-label text-meta">
          {props.nights} nights
        </span>
      </div>
      <div className="mb-5 text-caption text-meta">
        {/* Says what the figure covers, without repeating the figure. */}
        {props.price ? "All in — nothing to add on arrival" : "Tell us your dates for a total"}
      </div>

      {ended ? (
        // Never present a bookable form for something that cannot be booked.
        <div>
          <div className="mb-5 border-l-[3px] border-meta-inverse bg-ink-50 p-4">
            <div className="mb-1.5 font-mono text-label-sm uppercase text-meta">
              No longer running
            </div>
            <p className="m-0 text-body-xs leading-[22px] text-ink-900">
              This one has finished. Tell us when you can travel and we&rsquo;ll
              suggest the nearest week.
            </p>
          </div>
          <Link
            href="/contact"
            className="mb-5 flex h-12 w-full items-center justify-center rounded-full border border-ink-200 bg-white text-body-s font-medium text-ink-900 hover:bg-ink-50"
          >
            Ask us a question
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <input type="hidden" name="nights" value={props.nights} />
          <input type="hidden" name="adults" value={adults} />
          <input type="hidden" name="children" value={children} />
          <div className="mb-4 flex flex-col gap-2">
            <div>
              <FieldLabel htmlFor="rail-arrival">Arrival date</FieldLabel>
              <Input
                id="rail-arrival"
                name="arrival"
                type="date"
                value={arrival}
                /* The travel window, enforced by the picker rather than only
                   explained after the fact. Never earlier than today, whatever
                   the window says. */
                min={minArrival}
                max={maxArrival}
                onChange={(e) => setArrival(e.target.value)}
              />
              {/* The length is the package's, so the only thing worth saying is
                  when they would leave — which a guest should not have to count
                  out on their fingers. */}
              <p className="m-0 mt-1.5 text-caption text-meta">
                {arrival
                  ? `${props.nights} ${props.nights === 1 ? "night" : "nights"} — departing ${humanDate(addDays(arrival, props.nights))}`
                  : `${props.nights} ${props.nights === 1 ? "night" : "nights"}, set by the package`}
              </p>
            </div>
            {/* Capped by the stay this package is sold against, so nobody can
                enquire about six people in a villa that sleeps three and be told
                so only after a reply from Male'. */}
            <div className="flex gap-2">
              <div className="flex-1">
                <FieldLabel htmlFor="rail-adults">Adults</FieldLabel>
                <Select
                  id="rail-adults"
                  value={adults}
                  onChange={(e) => setAdults(e.target.value)}
                >
                  {Array.from({ length: adultCap }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "adult" : "adults"}
                    </option>
                  ))}
                </Select>
              </div>
              {childCap > 0 && (
                <div className="flex-1">
                  <FieldLabel htmlFor="rail-children">Children</FieldLabel>
                  <Select
                    id="rail-children"
                    value={children}
                    onChange={(e) => setChildren(e.target.value)}
                  >
                    {Array.from({ length: childCap + 1 }, (_, i) => i).map((n) => (
                      <option key={n} value={n}>
                        {n === 0 ? "None" : `${n} ${n === 1 ? "child" : "children"}`}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </div>
          </div>

          {blocked && verdict && !verdict.ok && (
            <div className="mb-4 border-l-[3px] border-meta-inverse bg-ink-50 p-4">
              <p className="m-0 text-body-xs leading-[22px] text-ink-900">{verdict.message}</p>
            </div>
          )}

          <div className="mb-4 flex flex-col gap-2">
            <div>
              <FieldLabel htmlFor="rail-name">Your name</FieldLabel>
              <Input id="rail-name" name="name" required placeholder="First and last" />
            </div>
            <div>
              <FieldLabel htmlFor="rail-email">Email</FieldLabel>
              <Input
                id="rail-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </div>
          </div>


          {/* Ticked before anything is sent, and read inline rather than behind
              a link that takes someone off the page mid-enquiry. Where an island
              has no text of its own, the links fall back to the site's pages. */}
          <div className="mb-4">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-teal-deep"
              />
              <span className="text-caption leading-5 text-ink-700">
                I accept the{" "}
                {props.termsText ? (
                  <button
                    type="button"
                    onClick={() => setShowing(showing === "terms" ? null : "terms")}
                    className="cursor-pointer underline underline-offset-2 hover:text-ink-900"
                  >
                    terms and conditions
                  </button>
                ) : (
                  <Link href="/terms" className="underline underline-offset-2 hover:text-ink-900">
                    terms and conditions
                  </Link>
                )}{" "}
                and{" "}
                {props.privacyText ? (
                  <button
                    type="button"
                    onClick={() => setShowing(showing === "privacy" ? null : "privacy")}
                    className="cursor-pointer underline underline-offset-2 hover:text-ink-900"
                  >
                    privacy policy
                  </button>
                ) : (
                  <Link href="/privacy" className="underline underline-offset-2 hover:text-ink-900">
                    privacy policy
                  </Link>
                )}
                .
              </span>
            </label>

            {showing && (
              <div className="mt-3 max-h-56 overflow-y-auto border-l-[3px] border-ink-200 bg-ink-50 p-4">
                <div className="mb-1.5 font-mono text-label-sm uppercase text-meta">
                  {showing === "terms" ? "Terms and conditions" : "Privacy policy"}
                </div>
                <p className="m-0 whitespace-pre-line text-body-xs leading-[22px] text-ink-900">
                  {showing === "terms" ? props.termsText : props.privacyText}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={blocked || !accepted}
            className="mb-2 h-[52px] w-full cursor-pointer rounded-full bg-ink-900 text-body-m font-medium text-white transition-colors duration-[220ms] hover:bg-ink-800 disabled:pointer-events-none disabled:opacity-50"
          >
            Check these dates
          </button>
          <Link
            href="/contact"
            className="mb-5 flex h-12 w-full items-center justify-center rounded-full border border-ink-200 bg-white text-body-s font-medium text-ink-900 hover:bg-ink-50"
          >
            Ask us a question
          </Link>
        </form>
      )}

      <div className="border-t border-ink-200 pt-5">
        <div className="mb-2.5 flex items-baseline gap-2.5">
          <Mark className="text-[11px]" />
          <span className="text-caption leading-5 text-ink-700">
            We confirm the room and the seats with the island before you pay anything
          </span>
        </div>
        <div className="flex items-baseline gap-2.5">
          <Mark className="text-[11px]" />
          <span className="text-caption leading-5 text-ink-700">
            Same-day reply from Male&rsquo;, not a call centre
          </span>
        </div>
      </div>
    </Card>
  );
}
