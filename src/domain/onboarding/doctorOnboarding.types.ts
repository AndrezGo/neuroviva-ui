/**
 * Domain types for doctor onboarding.
 * Pure TypeScript — no imports from other layers.
 */

export interface DoctorOnboardingPayload {
  firstName: string;
  lastName: string;
  specialty: string;
  medicalLicense: string;
}

export interface DoctorOnboardingResult {
  doctorId: string;
  isScientificCommittee: boolean;
  alreadyOnboarded: boolean;
}
