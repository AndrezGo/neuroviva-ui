import type { Appointment } from './caregiver.types';

/**
 * Returns true when an appointment needs a final outcome recorded.
 * Trusts the backend flag when present; falls back to client-side heuristic.
 */
export function isAwaitingOutcome(appointment: Appointment): boolean {
  if (appointment.requiresOutcome !== undefined) return appointment.requiresOutcome;
  // Fallback client-side
  const isPending =
    appointment.status === 'scheduled' || appointment.status === 'confirmed';
  return isPending && new Date(appointment.scheduledAt) < new Date();
}
