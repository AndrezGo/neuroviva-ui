/**
 * Domain types for caregiver onboarding.
 * Pure TypeScript — no imports from other layers.
 */

export type CaregiverCondition =
  | 'alzheimer'
  | 'parkinson'
  | 'dementia_mci'
  | 'als'
  | 'huntington'
  | 'other';

export interface ReminderPreferences {
  medications: boolean;
  appointments: boolean;
}

export interface CaregiverOnboardingData {
  patientName: string;
  relation: string | null;
  conditions: CaregiverCondition[];
  reminders: ReminderPreferences;
}
