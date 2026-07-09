'use client';

import { PatientShell } from '@/presentation/layout/PatientShell';
import { PatientNewsScreen } from '@/presentation/patient/PatientNewsScreen';

export default function PatientNewsPage() {
  return (
    <PatientShell activeTab="news">
      <PatientNewsScreen />
    </PatientShell>
  );
}
