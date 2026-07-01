'use client';

import { PatientShell } from '@/presentation/layout/PatientShell';
import { PatientHomeScreen } from '@/presentation/patient/PatientHomeScreen';

/**
 * Patient home page — thin page that wires the shell and screen together.
 */
export default function PatientHomePage() {
  return (
    <PatientShell>
      <PatientHomeScreen />
    </PatientShell>
  );
}
