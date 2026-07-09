'use client';

import { PatientShell } from '@/presentation/layout/PatientShell';
import { PatientArticlesScreen } from '@/presentation/patient/PatientArticlesScreen';

export default function PatientArticlesPage() {
  return (
    <PatientShell activeTab="articles">
      <PatientArticlesScreen />
    </PatientShell>
  );
}
