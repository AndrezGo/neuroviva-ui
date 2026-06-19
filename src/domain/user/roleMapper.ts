/**
 * Maps between frontend UserRole values (English) and backend BackendRoleName values (Spanish).
 * The frontend uses 'caregiver' | 'professional' | 'patient' for UI display.
 * The backend API expects 'cuidador' | 'medico' | 'paciente'.
 */

import type { UserRole } from '@/domain/auth/auth.types';
import type { BackendRoleName } from './user.types';

const frontendToBackend: Record<UserRole, BackendRoleName> = {
  caregiver: 'cuidador',
  professional: 'medico',
  patient: 'paciente',
};

const backendToFrontend: Record<BackendRoleName, UserRole> = {
  cuidador: 'caregiver',
  medico: 'professional',
  paciente: 'patient',
};

/**
 * Converts a frontend UserRole to the backend API role name.
 */
export function toBackendRole(role: UserRole): BackendRoleName {
  return frontendToBackend[role];
}

/**
 * Converts a backend role name to the frontend UserRole.
 * Returns null if the role name is not recognized.
 */
export function toFrontendRole(role: BackendRoleName): UserRole {
  return backendToFrontend[role];
}
