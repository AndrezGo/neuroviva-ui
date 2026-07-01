/**
 * Domain types for the Patient feature.
 * Pure TypeScript — no imports from other layers.
 */

export interface PatientLookupResult {
  id: string;
  name: string;
  documentNumber: string;
  hasUserAccount: boolean;
}

export interface PatientOnboardingPayload {
  documentNumber: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  documentNumber: string;
  conditions: string[];
  dateOfBirth: string;
}
