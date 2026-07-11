'use client';

import { PatientShell } from '@/presentation/layout/PatientShell';
import { PatientHomeScreen } from '@/presentation/patient/PatientHomeScreen';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { getGreeting, getFirstName } from '@/shared/lib/greeting';

/**
 * Patient home page — thin page that wires the shell and screen together.
 * Resolves greeting data here and passes it as props to PatientHomeScreen.
 */
export default function PatientHomePage() {
  const backendUser = useAuthStore((s) => s.backendUser);
  const user = useAuthStore((s) => s.user);

  const firstName = getFirstName(backendUser?.name ?? user?.fullName);
  const greeting = getGreeting();

  return (
    <PatientShell activeTab="home">
      <PatientHomeScreen greeting={greeting} firstName={firstName} />
    </PatientShell>
  );
}
