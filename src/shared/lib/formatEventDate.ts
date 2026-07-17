/**
 * Formats an ISO 8601 date string into a localised short date+time string.
 * Shared across medical record list screens.
 * Pure function — no framework imports.
 */
export function formatEventDate(iso: string): string {
  const date = new Date(iso);
  const weekday = new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(date);
  const day = new Intl.DateTimeFormat('es-CO', { day: 'numeric' }).format(date);
  const month = new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(date);
  const time = new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace('.', '');
  return `${cap(weekday)} ${day} ${cap(month)} · ${time}`;
}
