'use client';

import { PatientShell } from '@/presentation/layout/PatientShell';
import { PatientChannelsScreen } from '@/presentation/patient/PatientChannelsScreen';

export default function PatientChannelsPage() {
  return (
    <PatientShell activeTab="channels">
      <PatientChannelsScreen />
    </PatientShell>
  );
}
