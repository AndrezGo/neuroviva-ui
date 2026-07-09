'use client';

import { PatientShell } from '@/presentation/layout/PatientShell';
import { PatientCommunityScreen } from '@/presentation/patient/PatientCommunityScreen';

export default function PatientCommunityPage() {
  return (
    <PatientShell activeTab="community">
      <PatientCommunityScreen />
    </PatientShell>
  );
}
