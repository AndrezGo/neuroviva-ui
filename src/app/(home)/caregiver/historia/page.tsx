'use client';

import { CaregiverComingSoon } from '@/presentation/caregiver/CaregiverComingSoon';
import { CaregiverShell } from '@/presentation/layout/CaregiverShell';

export default function CaregiverHistoriaPage() {
  return (
    <CaregiverShell activeTab="history">
      <CaregiverComingSoon title="Historia" activeTab="history" />
    </CaregiverShell>
  );
}
