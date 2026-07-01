/**
 * Shared date utilities for NeuroViva.
 * Pure TypeScript — no React, no imports from other layers.
 *
 * IMPORTANT: We never parse ISO strings with `new Date("YYYY-MM-DD")` because
 * that constructor treats the input as UTC midnight, which shifts the calendar
 * date in negative-offset timezones. All ISO parsing is done by splitting on '-'.
 */

/** Spanish month names in calendar order (index 0 = January). */
export const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

/**
 * Returns the number of days in a given month/year.
 * `month` is 1-based (1 = January, 12 = December).
 * Uses `new Date(year, month, 0)` which relies on numeric arguments (local time)
 * and is safe — this is NOT string-based Date parsing.
 * Handles leap years correctly.
 */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Converts year/month/day parts to an ISO "YYYY-MM-DD" string.
 * `month` is 1-based (1 = January). `day` is 1-based.
 * Returns `null` if any part is invalid or if the day exceeds the days in
 * the given month (e.g. February 30 is rejected).
 */
export function toISODate(year: number, month: number, day: number): string | null {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    year < 1
  ) {
    return null;
  }

  if (day > daysInMonth(year, month)) {
    return null;
  }

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/**
 * Parses an ISO "YYYY-MM-DD" string into its numeric parts.
 * Splits on '-' — does NOT use `new Date` for parsing.
 * Returns `null` for null/undefined/empty input or if any part is non-numeric.
 */
export function parseISODate(
  iso: string | null | undefined,
): { year: number; month: number; day: number } | null {
  if (!iso) return null;

  const parts = iso.split('-');
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 1) return null;

  return { year, month, day };
}

/**
 * Formats an ISO date string as a human-readable Spanish date.
 * Example: "1955-03-15" -> "15 de marzo de 1955"
 * Returns `null` for invalid or missing input.
 * Built from parsed parts — does NOT use `new Date`.
 */
export function formatBirthDateES(iso: string | null | undefined): string | null {
  const parts = parseISODate(iso);
  if (!parts) return null;

  const monthName = MONTHS_ES[parts.month - 1];
  if (!monthName) return null;

  return `${parts.day} de ${monthName.toLowerCase()} de ${parts.year}`;
}

/**
 * Computes the current age in years from an ISO birth-date string.
 * Uses `new Date()` only to get today's local date (safe — no string parsing).
 * All comparison logic works on numeric year/month/day to avoid UTC shift.
 * Returns `null` for invalid or missing input.
 */
export function calculateAge(iso: string | null | undefined): number | null {
  const parts = parseISODate(iso);
  if (!parts) return null;

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1; // getMonth() is 0-based
  const todayDay = today.getDate();

  let age = todayYear - parts.year;

  // If we haven't reached the birthday yet this year, subtract one year.
  if (
    todayMonth < parts.month ||
    (todayMonth === parts.month && todayDay < parts.day)
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}
