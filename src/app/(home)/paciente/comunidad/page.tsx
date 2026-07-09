'use client';

import { PatientShell } from '@/presentation/layout/PatientShell';
import { PatientComingSoonScreen } from '@/presentation/patient/PatientComingSoonScreen';

export default function PatientCommunityPage() {
  return (
    <PatientShell activeTab="community">
      <PatientComingSoonScreen title="Comunidad" />
    </PatientShell>
  );
}
