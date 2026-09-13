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
import { PriceBlock } from "./price-block";
import type { PackagePrice } from "@/lib/design/pricing";

export interface BookingRailProps {
  packageId: string;
  packageName: string;
  price: PackagePrice | null;
  nights: number;
  minNights: number;
  maxNights: number | null;
  lifecycle: PackageLifecycle;
  travel: { start: Date | null; end: Date | null };
  booking: { start: Date | null; end: Date | null };
  blackouts: Blackout[];
}

export function BookingRail(props: BookingRailProps) {
  const [arrival, setArrival] = useState("");
  const [nights, setNights] = useState(String(props.nights));
  const [guests, setGuests] = useState("2");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const ended = props.lifecycle === "ended";

  // Runs as the guest types. The server runs the same function again on submit.
  const verdict = useMemo(() => {
    if (!arrival) return null;
    const date = new Date(arrival);
    if (Number.isNaN(date.getTime())) return null;
    return checkDates({
      arrival: date,
      nights: Number(nights),
      travel: props.travel,
      booking: props.booking,
      blackouts: props.blackouts,
      minNights: props.minNights,
      maxNights: props.maxNights,
    });
  }, [arrival, nights, props.travel, props.booking, props.blackouts, props.minNights, props.maxNights]);

  const blocked = verdict !== null && !verdict.ok;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setServerError(null);
    const data = new FormData(e.currentTarget);
    data.set("packageId", props.packageId);
    const result = await submitDateEnquiry(data);
    if (result.success) {
      setState("sent");
    } else {
      setState("error");
      setServerError(result.error ?? null);
    }
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
        <PriceBlock price={props.price} size="lg" className="[&>div:last-child]:hidden" />
        <span className="font-mono text-label text-meta">
          {props.nights} nights
        </span>
      </div>
      <div className="mb-5 text-caption text-meta">
        {props.price
          ? `${props.price.currency === "MVR" ? "MVR " : "$"}${props.price.total.toLocaleString()} total, all in`
          : "Tell us your dates for a total"}
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
          <input type="hidden" name="adults" value={guests} />
          <div className="mb-4 flex flex-col gap-2">
            <div>
              <FieldLabel htmlFor="rail-arrival">Arrival date</FieldLabel>
              <Input
                id="rail-arrival"
                name="arrival"
                type="date"
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <FieldLabel htmlFor="rail-nights">Nights</FieldLabel>
                <Select
                  id="rail-nights"
                  name="nights"
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                >
                  {Array.from(
                    { length: (props.maxNights ?? props.minNights + 6) - props.minNights + 1 },
                    (_, i) => props.minNights + i
                  ).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex-1">
                <FieldLabel htmlFor="rail-guests">Guests</FieldLabel>
                <Select
                  id="rail-guests"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "guest" : "guests"}
                    </option>
                  ))}
                </Select>
              </div>
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

          {state === "error" && serverError && (
            <div className="mb-4 border-l-[3px] border-meta-inverse bg-ink-50 p-4">
              <div className="mb-1.5 font-mono text-label-sm uppercase text-meta">
                Needs attention
              </div>
              <p className="m-0 text-body-xs leading-[22px] text-ink-900">{serverError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={blocked || state === "sending"}
            className="mb-2 h-[52px] w-full cursor-pointer rounded-full bg-ink-900 text-body-m font-medium text-white transition-colors duration-[220ms] hover:bg-ink-800 disabled:pointer-events-none disabled:opacity-50"
          >
            {state === "sending" ? "Sending…" : "Check these dates"}
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
