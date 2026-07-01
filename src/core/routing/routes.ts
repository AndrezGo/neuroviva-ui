/**
 * Typed route helpers for all application routes.
 * Import this instead of using raw string literals.
 */
export const routes = {
  splash: () => '/' as const,
  login: () => '/login' as const,
  register: () => '/register' as const,
  forgotPassword: () => '/forgot-password' as const,
  roleSelection: () => '/role-selection' as const,
  authComplete: () => '/auth-complete' as const,
  // Role-specific home screens
  homeCaregiver: () => '/caregiver' as const,
  homeDoctor: () => '/doctor' as const,
  homePatient: () => '/patient' as const,
  // Doctor tab routes
  doctorAlerts: () => '/doctor/alertas' as const,
  doctorCuraduria: () => '/doctor/curaduria' as const,
  doctorProfile: () => '/doctor/perfil' as const,
  // Patient home (new shell-based route)
  patientHome: () => '/paciente' as const,
  // Onboarding flows
  onboardingCaregiver: () => '/onboarding/caregiver' as const,
  onboardingPatient: () => '/onboarding/paciente' as const,
  // Caregiver tab routes
  caregiverHome: () => '/caregiver' as const,
  caregiverMeds: () => '/caregiver/medicinas' as const,
  caregiverMedsNew: () => '/caregiver/medicinas/nuevo' as const,
  caregiverMedHistory: (id: string) => `/caregiver/medicinas/${id}/historial` as const,
  caregiverSymptoms: () => '/caregiver/sintomas' as const,
  caregiverAgenda: () => '/caregiver/agenda' as const,
  caregiverAgendaNew: () => '/caregiver/agenda/nueva' as const,
  caregiverHistory: () => '/caregiver/historia' as const,
  caregiverProfile: () => '/caregiver/perfil' as const,
  caregiverPatientProfile: () => '/caregiver/perfil-paciente' as const,
} as const;

export type AppRoute = ReturnType<(typeof routes)[keyof typeof routes]>;

/**
 * Maps a backend role name to the corresponding home route.
 * Falls back to role-selection if the role is unknown.
 */
export function getHomeByRole(role: string): string {
  switch (role) {
    case 'cuidador':
      return routes.homeCaregiver();
    case 'medico':
      return routes.homeDoctor();
    case 'paciente':
      return routes.patientHome();
    default:
      return routes.roleSelection();
  }
}

/**
 * Destination right after a user picks their role.
 * Caregivers and patients go through the onboarding wizard first; other roles
 * go straight to their home until their onboarding flows exist.
 */
export function getPostRoleRoute(role: string): string {
  if (role === 'cuidador') return routes.onboardingCaregiver();
  if (role === 'paciente') return routes.onboardingPatient();
  return getHomeByRole(role);
}
