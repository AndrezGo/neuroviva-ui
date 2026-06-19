/**
 * Pure greeting utilities — no framework dependencies.
 * Safe to import in any layer and unit-testable without mocking.
 */

/**
 * Returns a time-appropriate Spanish greeting.
 * - 05:00–11:59 → 'Buenos días'
 * - 12:00–18:59 → 'Buenas tardes'
 * - 19:00–04:59 → 'Buenas noches'
 */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/**
 * Extracts the first name token from a full name string.
 * If the input looks like an email address, uses only the local part (before @).
 * Returns an empty string if the input is null, undefined, or blank.
 */
export function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return '';
  const cleaned = fullName.includes('@') ? fullName.split('@')[0] : fullName;
  return (cleaned ?? '').trim().split(/\s+/)[0] ?? '';
}
