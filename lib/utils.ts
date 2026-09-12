// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import slugify from "slugify";

/**
 * The design system's type scale, declared as `--text-*` tokens in globals.css.
 *
 * tailwind-merge has to be told about these. It resolves conflicts by class
 * group, and `text-*` is ambiguous — it covers both font-size and text-colour.
 * Without this list, tailwind-merge reads `text-display-xl` as a colour and
 * silently drops any `text-white` that precedes it, which renders white-on-photo
 * headings in near-black. Nothing errors; the page is just wrong.
 */
const FONT_SIZES = [
  "display-xl",
  "display-l",
  "display-m",
  "heading-l",
  "heading-m",
  "heading-s",
  "card-title",
  "body-l",
  "body-m",
  "body-s",
  "body-xs",
  "caption",
  "label",
  "label-sm",
  "price",
  "price-lg",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: FONT_SIZES }],
    },
  },
});

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

/**
 * Format a date for display
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", options).format(d);
}

/**
 * Format a date range
 */
export function formatDateRange(
  start: Date | string,
  end: Date | string
): string {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = typeof end === "string" ? new Date(end) : end;

  const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const year = endDate.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  }

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

/**
 * Calculate number of nights between two dates
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

/**
 * Strip HTML tags from a string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Get excerpt from HTML content
 */
export function getExcerpt(html: string, length: number = 150): string {
  const text = stripHtml(html);
  return truncate(text, length);
}

/**
 * Pluralize a word based on count
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}

/**
 * Format guest count for display
 */
export function formatGuests(
  adults: number,
  children: number = 0,
  infants: number = 0
): string {
  const parts: string[] = [];

  parts.push(`${adults} ${pluralize(adults, "adult")}`);

  if (children > 0) {
    parts.push(`${children} ${pluralize(children, "child", "children")}`);
  }

  if (infants > 0) {
    parts.push(`${infants} ${pluralize(infants, "infant")}`);
  }

  return parts.join(", ");
}

/**
 * Generate array of numbers (useful for pagination, etc.)
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if we're running on the server
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

/**
 * Check if we're running on the client
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Create a URL with query parameters
 */
export function createUrl(
  baseUrl: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(baseUrl, "http://localhost");
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.pathname + url.search;
}
