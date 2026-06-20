/**
 * Domain types for the Caregiver feature.
 * Pure TypeScript — no imports from other layers.
 */

export interface CaregiverPatient {
  id: string;
  name: string;
  age: number;
  condition: string;
  conditionStage: string;
}

export type MedicationStatus = 'pending' | 'taken' | 'skipped';

export interface TodayMedication {
  id: string;
  name: string;
  dose: string;
  scheduledTime: string;
  status: MedicationStatus;
  isNow: boolean;
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
  patientName: string;
  patientAge?: number;
  relation: string;
  condition: string;
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
  createdAt: string;
  takenToday?: boolean;
}

export interface CreateMedicationInput {
  name: string;
  dose: string;
  frequency: string;
  startDate?: string;
  endDate?: string;
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

export interface Appointment {
  id: string;
  title: string;
  type: string;
  scheduledAt: string;
  status: string;
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
