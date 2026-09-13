// lib/design/availability.ts
//
// Packages are date-constrained. Two independent windows govern them:
//
//   travelWindow  — when you can actually be there
//   bookingWindow — when we're selling it
//
// Plus blackout ranges for closures and sold-out stretches. There is deliberately
// no per-date capacity: the site's promise is "we confirm the room and the seats
// with the island before you pay", not a live inventory lookup. Modelling
// allotment would make that copy a lie.
//
// Null bounds mean unconstrained. Every window in the live data is null today, so
// "null is open" is the path that actually runs.

export type PackageLifecycle = "upcoming" | "open" | "ended";

export interface DateWindow {
  start: Date | null;
  end: Date | null;
}

export interface Blackout {
  startDate: Date;
  endDate: Date;
  reason: string | null;
}

const DAY = 24 * 60 * 60 * 1000;

/** Midnight, so a same-day comparison never turns on the clock. */
function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * Derived, never stored. A stored flag would go stale the moment a window
 * elapsed, and nothing would be watching.
 */
export function lifecycleOf(args: {
  travel: DateWindow;
  booking: DateWindow;
  now?: Date;
}): PackageLifecycle {
  const now = startOfDay(args.now ?? new Date());

  const closed =
    (args.travel.end !== null && startOfDay(args.travel.end) < now) ||
    (args.booking.end !== null && startOfDay(args.booking.end) < now);
  if (closed) return "ended";

  const notYet =
    (args.travel.start !== null && startOfDay(args.travel.start) > now) ||
    (args.booking.start !== null && startOfDay(args.booking.start) > now);
  if (notYet) return "upcoming";

  return "open";
}

/** For the "From March" marker on an upcoming card. */
export function opensLabel(travel: DateWindow, booking: DateWindow): string | null {
  const first = [travel.start, booking.start]
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime())[0];
  if (!first) return null;
  return `From ${first.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`;
}

export type DateCheckReason =
  | "before-window"
  | "after-window"
  | "blacked-out"
  | "too-short"
  | "too-long";

export type DateCheck =
  | { ok: true }
  | {
      ok: false;
      reason: DateCheckReason;
      /** Shown to the guest. Explains the constraint and offers the next step. */
      message: string;
      window?: DateWindow;
      blackout?: Blackout;
    };

function monthYear(d: Date): string {
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/**
 * Validate a requested stay. Called from the booking rail as the guest types and
 * again inside the server action — one rule, two places, so the client can never
 * talk the server into accepting something.
 */
export function checkDates(args: {
  arrival: Date;
  nights: number;
  travel: DateWindow;
  booking: DateWindow;
  blackouts: Blackout[];
  now?: Date;
}): DateCheck {
  const { arrival, nights, travel, booking, blackouts } = args;

  // No minimum or maximum check: a package is one length, and `nights` is
  // that length rather than anything a guest typed. What can still be wrong is
  // WHEN they arrive, which is everything below.

  const arrivalDay = startOfDay(arrival);
  // Departure is exclusive: a stay of 4 nights arriving on the 10th leaves on the 14th.
  const departureDay = arrivalDay + nights * DAY;

  if (travel.start !== null && arrivalDay < startOfDay(travel.start)) {
    return {
      ok: false,
      reason: "before-window",
      window: travel,
      message: `This package runs from ${monthYear(
        travel.start
      )}. Tell us your dates and we'll suggest the nearest week.`,
    };
  }

  if (travel.end !== null && arrivalDay > startOfDay(travel.end)) {
    return {
      ok: false,
      reason: "after-window",
      window: travel,
      message: `This package ran until ${monthYear(
        travel.end
      )}. Send us your dates and we'll point you at what's open then.`,
    };
  }

  if (booking.end !== null && startOfDay(args.now ?? new Date()) > startOfDay(booking.end)) {
    return {
      ok: false,
      reason: "after-window",
      window: booking,
      message:
        "We've stopped taking bookings on this one. Send us your dates and we'll tell you what's still open.",
    };
  }

  // A stay clashes when it starts on or before the blackout's last day and ends
  // after its first — which is why a stay ending the day a blackout opens is fine.
  const clash = blackouts.find(
    (b) =>
      arrivalDay <= startOfDay(b.endDate) && departureDay > startOfDay(b.startDate)
  );
  if (clash) {
    return {
      ok: false,
      reason: "blacked-out",
      blackout: clash,
      message: clash.reason
        ? `Those nights aren't available — ${clash.reason.toLowerCase()}. Try a week either side, or tell us your dates and we'll find the nearest.`
        : "Those nights aren't available. Try a week either side, or tell us your dates and we'll find the nearest.",
    };
  }

  return { ok: true };
}
