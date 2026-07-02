/**
 * Domain types for the Caregiver feature.
 * Pure TypeScript — no imports from other layers.
 */

export interface CaregiverPatient {
  id: string;
  name: string;
  age: number;
  dateOfBirth?: string | null;
  conditions: string[];
  conditionStage: string | null;
}

export type MedicationStatus = 'pending' | 'taken' | 'skipped';

export interface TodayMedication {
  id: string;
  name: string;
  dose: string;
  scheduledTime: string;
  status: MedicationStatus;
  isNow: boolean;
  /** ISO 8601 timestamp of the next scheduled dose. Null when the medication
   * has no fixed interval, or no prior dose has been logged to anchor it. */
  nextDoseAt: string | null;
}

export interface TodayAppointment {
  id: string;
  title: string;
  type: string;
  scheduledAt: string;
}

export interface CaregiverToday {
  medications: TodayMedication[];
  appointments: TodayAppointment[];
}

export interface CaregiverOnboardingPayload {
  documentNumber: string;
  patientName: string;
  patientAge?: number | null;
  patientDateOfBirth?: string | null;
  relation: string;
  conditions: string[];
}

export interface CaregiverOnboardingResult {
  patientId: string;
}

// ── Medications ──────────────────────────────────────────────────────────────

export interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  prescribingDoctorName?: string | null;
  notes?: string | null;
  createdAt: string;
  takenToday?: boolean;
}

export interface CreateMedicationInput {
  name: string;
  dose: string;
  frequency: string;
  startDate?: string;
  endDate?: string;
  prescribingDoctorName?: string;
  notes?: string;
}

export interface UpdateMedicationInput {
  name: string;
  dose: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribingDoctorName?: string;
  notes?: string;
}

export interface CreateMedicationResult {
  medicationId: string;
}

export interface LogMedicationInput {
  notes?: string;
}

export interface LogMedicationResult {
  logId: string;
}

// ── Appointments ─────────────────────────────────────────────────────────────

export type AppointmentOutcome = 'attended' | 'cancelled' | 'missed';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'attended' | 'missed';

export interface Appointment {
  id: string;
  title: string;
  type: string;
  scheduledAt: string;
  status: AppointmentStatus;
  requiresOutcome: boolean;
}

export interface CreateAppointmentInput {
  title: string;
  type: string;
  scheduledAt: string;
  notes?: string;
}

export interface CreateAppointmentResult {
  appointmentId: string;
}

export interface MedicationLog {
  id: string;
  takenAt: string; // ISO 8601
  notes: string | null;
}

// ── Symptoms ─────────────────────────────────────────────────────────────────

export interface Symptom {
  id: string;
  type: string;
  intensity: number;
  description?: string | null;
  loggedAt: string; // ISO 8601
}

export interface CreateSymptomPayload {
  type: string;
  intensity: number;
  description?: string | null;
  loggedAt?: string | null;
}

// ── Notifications ────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

// ── Clinical History ────────────────────────────────────────────────────────

export interface HistoryEvent {
  id: string;
  type: string; // "symptom" | "consultation" | "exam" | "procedure" | "teleconsultation" | "medication" | "note" | "other"
  title: string;
  description?: string | null;
  eventDate: string; // ISO 8601
  status?: string | null; // present only for appointment-type events
}

export interface CreateHistoryNoteInput {
  eventType: string; // "consultation" | "exam" | "note" | "other"
  description: string;
  eventDate?: string | null; // optional; backend uses "now" if omitted
}

export interface CreateHistoryNoteResult {
  recordId: string;
}

// ── Notifications ────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}
