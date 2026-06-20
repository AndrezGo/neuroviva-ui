'use client';

import { CaregiverComingSoon } from '@/presentation/caregiver/CaregiverComingSoon';
import { CaregiverShell } from '@/presentation/layout/CaregiverShell';

export default function CaregiverSintomasPage() {
  return (
    <CaregiverShell activeTab="symptoms">
      <CaregiverComingSoon title="Síntomas" activeTab="symptoms" />
    </CaregiverShell>
  );
}
