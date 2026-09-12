// lib/design/labels.ts
//
// Enum-to-prose. The designs never show a screaming-snake enum, and these strings
// appear in spec sheets where they sit beside hand-written copy, so they have to
// read like the rest of the page.

import type { AccommodationType, BoardBasis, TransferType } from "@prisma/client";

const TRANSFER: Record<TransferType, string> = {
  SPEEDBOAT: "Speedboat",
  SEAPLANE: "Seaplane",
  DOMESTIC_FLIGHT: "Domestic flight",
  FERRY: "Ferry",
  YACHT: "Yacht",
};

const STAY: Record<AccommodationType, string> = {
  RESORT: "Resort",
  GUESTHOUSE: "Guesthouse",
  HOTEL: "Hotel",
  LIVEABOARD: "Liveaboard",
};

const BOARD: Record<BoardBasis, string> = {
  ROOM_ONLY: "Room only",
  BED_AND_BREAKFAST: "Bed and breakfast",
  HALF_BOARD: "Half-board",
  FULL_BOARD: "Full-board",
  ALL_INCLUSIVE: "All-inclusive",
};

export function transferLabel(type: TransferType | null): string | null {
  return type ? TRANSFER[type] : null;
}

export function accommodationTypeLabel(type: AccommodationType): string {
  return STAY[type];
}

export function boardBasisLabel(basis: BoardBasis | null): string | null {
  return basis ? BOARD[basis] : null;
}

/**
 * "Speedboat, 30 min". Returns null when either half is missing, so the spec row
 * drops rather than printing a half-sentence.
 */
export function transferSummary(
  type: TransferType | null,
  minutes: number | null
): string | null {
  const label = transferLabel(type);
  if (!label) return null;
  if (minutes === null) return label;
  return `${label}, ${minutes} min`;
}

/** "Baa Atoll · 4 nights" — the mono eyebrow on every package card. */
export function packageEyebrow(atoll: string, nights: number): string {
  return `${atoll} · ${nights} ${nights === 1 ? "night" : "nights"}`;
}
